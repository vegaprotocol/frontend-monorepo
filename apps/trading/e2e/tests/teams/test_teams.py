import pytest
from playwright.sync_api import expect, Page
from vega_python_protos import vega as vega_protos
from vega_sim.null_service import VegaServiceNull
from conftest import init_vega, cleanup_container
from actions.utils import next_epoch, change_keys
from fixtures.market import setup_continuous_market
from conftest import auth_setup, init_page, init_vega, risk_accepted_setup
from typing import Generator, Tuple
from wallet_config import PARTY_A, PARTY_B, PARTY_C, PARTY_D, MM_WALLET, MM_WALLET2

COMPETITIONS_URL = "/#/competitions/"
TEAMS_URL = "/#/competitions/teams/"


@pytest.fixture(scope="module")
def setup_environment(
    request, browser
) -> Generator[Tuple[Page, VegaServiceNull, dict], None, None]:
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        setup_data = setup_teams_and_games(vega_instance)
        yield vega_instance, setup_data


@pytest.fixture(scope="module")
def competitions_page(
    setup_environment, browser, request
) -> Generator[Tuple[Page, str, VegaServiceNull], None, None]:
    vega_instance, setup_data = setup_environment
    team_name = setup_data["team_name"]
    with init_page(vega_instance, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega_instance, page)
        page.goto(COMPETITIONS_URL)
        change_keys(page, vega_instance, PARTY_A.name)
        yield page, team_name, vega_instance


@pytest.fixture(scope="module")
def team_page(
    setup_environment, browser, request
) -> Generator[Tuple[Page, str, VegaServiceNull], None, None]:
    vega_instance, setup_data = setup_environment
    team_name = setup_data["team_name"]
    team_id = setup_data["team_id"]
    with init_page(vega_instance, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega_instance, page)
        page.goto(f"{TEAMS_URL}{team_id}")
        yield page, team_name, team_id, vega_instance


def setup_teams_and_games(vega: VegaServiceNull):
    tDAI_market = setup_continuous_market(vega, custom_quantum=100000)
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=MM_WALLET2.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_C.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_A.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_D.name, asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)

    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    vega.create_asset(
        MM_WALLET.name,
        name="VEGA",
        symbol="VEGA",
        decimals=5,
        max_faucet_amount=1e10,
        quantum=100000,
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    VEGA_asset_id = vega.find_asset_id(symbol="VEGA")
    vega.mint(PARTY_A.name, VEGA_asset_id, 1e5)
    vega.mint(MM_WALLET2.name, VEGA_asset_id, 1e5)
    vega.mint(PARTY_B.name, VEGA_asset_id, 1e5)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    team_name = create_team(vega)

    next_epoch(vega)
    teams = vega.list_teams()

    # list_teams actually returns a dictionary {"team_id": Team}
    team_id = list(teams.keys())[0]
    vega.create_referral_set(
        key_name=PARTY_D.name,
        name="test",
        team_url="https://vega.xyz",
        closed=False,
    )
    next_epoch(vega)
    teams = vega.list_teams()

    team_id_2 = list(teams.keys())[0]
    vega.apply_referral_code(PARTY_B.name, team_id_2)

    #vega.apply_referral_code(PARTY_B.name, team_id)

    # go to next epoch so we can check joinedAt and joinedAtEpoch appropriately
    next_epoch(vega)

    vega.apply_referral_code(PARTY_C.name, team_id)

    next_epoch(vega)

    #vega.apply_referral_code(PARTY_D.name, team_id)

    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    current_epoch = vega.statistics().epoch_seq
    game_start = current_epoch + 2
    game_end = current_epoch + 15

    current_epoch = vega.statistics().epoch_seq
    print(f"[EPOCH: {current_epoch}] creating recurring transfer")
    print(f"Game start: {game_start}")
    print(f"Game game end: {game_end}")

    vega.recurring_transfer(
        from_key_name=MM_WALLET2.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=VEGA_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        entity_scope=vega_protos.vega.ENTITY_SCOPE_TEAMS,
        n_top_performers=1,
        amount=100,
        factor=1.0,
        start_epoch=game_start,
        end_epoch=game_end,
        window_length=15,
    )
    vega.recurring_transfer(
        from_key_name="Key 1",
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=VEGA_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        entity_scope=vega_protos.vega.ENTITY_SCOPE_INDIVIDUALS,
        individual_scope=vega_protos.vega.INDIVIDUAL_SCOPE_IN_TEAM,
        n_top_performers=1,
        amount=100,
        factor=1.0,
        window_length=5,
    )
    vega.recurring_transfer(
        from_key_name=MM_WALLET.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        entity_scope=vega_protos.vega.ENTITY_SCOPE_INDIVIDUALS,
        individual_scope=vega_protos.vega.INDIVIDUAL_SCOPE_NOT_IN_TEAM,
        n_top_performers=1,
        amount=100,
        factor=1.0,
        window_length=15
    )
    next_epoch(vega)
    print(f"[EPOCH: {vega.statistics().epoch_seq}] starting order activity")

    # Team statistics will only return data when team has been active
    # for DEFAULT_AGGREGATION_EPOCHS epochs
    #
    # https://vegaprotocol.slack.com/archives/C02KVKMAE82/p1706635625851769?thread_ts=1706631542.576449&cid=C02KVKMAE82

    # Create trading activity for 10 epochs (which is the default)
    for i in range(10):
        vega.submit_order(
            trading_key=PARTY_D.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.submit_order(
            trading_key=PARTY_C.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.submit_order(
            trading_key=PARTY_B.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.submit_order(
            trading_key=PARTY_A.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        next_epoch(vega)
        print(f"[EPOCH: {vega.statistics().epoch_seq}] {i} epoch passed")

    return {
        "market_id": tDAI_market,
        "asset_id": tDAI_asset_id,
        "team_id": team_id,
        "team_id_2": team_id_2,
        "team_name": team_name,
    }


def create_team(vega: VegaServiceNull):
    team_name = "Foobar"
    vega.create_referral_set(
        key_name=PARTY_A.name,
        name=team_name,
        team_url="https://vega.xyz",
        closed=False,
    )

    return team_name


def test_team_page_games_table(team_page: Tuple[Page, str, str, VegaServiceNull]):
    page, team_name, team_id, vega = team_page
    page.get_by_test_id("games-toggle").click()
    expect(page.get_by_test_id("games-toggle")).to_have_text("Results (9)")
    expect(page.get_by_test_id("rank-0")).to_have_text("1")
    expect(page.get_by_test_id("epoch-0")).to_have_text("19")
    expect(page.get_by_test_id("endtime-0")).to_be_visible()
    expect(page.get_by_test_id("type-0")).to_have_text("Price maker fees paid • tDAI ")
    expect(page.get_by_test_id("asset-0")).to_have_text("VEGA")
    expect(page.get_by_test_id("daily-0")).to_have_text("100.00")
    expect(page.get_by_test_id("rank-0")).to_have_text("1")
    expect(page.get_by_test_id("amount-0")).to_have_text("50.00")
    expect(page.get_by_test_id("participatingTeams-0")).to_have_text("2")
    expect(page.get_by_test_id("participatingMembers-0")).to_have_text("4")

def test_team_page_members_table(team_page: Tuple[Page, str, str, VegaServiceNull]):
    page, team_name, team_id, vega = team_page
    change_keys(page, vega, PARTY_A.name)
    page.get_by_test_id("members-toggle").click()
    expect(page.get_by_test_id("members-toggle")).to_have_text("Members (2)")
    expect(page.get_by_test_id("referee-0")).to_be_visible()
    expect(page.get_by_test_id("icon-question-mark").nth(0)).to_be_visible()
    expect(page.get_by_test_id("referee-1").locator(".text-muted").nth(1)).to_have_text(
        "Owner"
    )
    expect(page.get_by_test_id("joinedAt-0")).to_be_visible()
    expect(page.get_by_test_id("joinedAtEpoch-0")).to_have_text("8")


def test_team_page_headline(team_page: Tuple[Page, str, str, VegaServiceNull]):
    page, team_name, team_id, vega = team_page
    expect(page.get_by_test_id("team-name")).to_have_text(team_name)
    expect(page.get_by_test_id("icon-open-external").nth(1)).to_be_visible()
    expect(page.get_by_test_id("icon-copy").first).to_be_visible()
    expect(page.get_by_test_id("members-count-stat")).to_have_text("2")

    expect(page.get_by_test_id("total-games-stat")).to_have_text("1")

    # TODO this still seems wrong as its always 0
    expect(page.get_by_test_id("total-volume-stat")).to_have_text("0")

    expect(page.get_by_test_id("rewards-paid-stat")).to_have_text("450")



def test_leaderboard(competitions_page: Tuple[Page, str, VegaServiceNull]):
    page, team_name, vega = competitions_page
    page.reload()
    expect(page.get_by_test_id("rank-0").locator(".text-yellow-300")).to_have_count(1)
    # the 1st place is shared between the 2 participants in this case

    expect(
        page.get_by_test_id("rank-1").locator(".text-yellow-300")
    ).to_have_count(1)
    expect(page.get_by_test_id("team-0")).to_have_text(team_name)
    expect(page.get_by_test_id("status-0")).to_have_text("Public")
    expect(page.get_by_test_id("earned-0")).to_have_text("450")
    expect(page.get_by_test_id("games-0")).to_have_text("1")

    # TODO  still odd that this is 0
    expect(page.get_by_test_id("volume-0")).to_have_text("0")




def test_game_card(competitions_page: Tuple[Page, str, VegaServiceNull]):
    page, team_name, vega = competitions_page
    expect(page.get_by_test_id("active-rewards-card")).to_have_count(1)
    game_1 = page.get_by_test_id("active-rewards-card").first
    expect(game_1).to_be_visible()
    expect(game_1.get_by_test_id("entity-scope")).to_have_text("Team")
    expect(game_1.get_by_test_id("locked-for")).to_have_text("1 epoch")
    expect(game_1.get_by_test_id("reward-value")).to_have_text("100.00")
    expect(game_1.get_by_test_id("reward-asset")).to_have_text("VEGA")
    expect(game_1.get_by_test_id("distribution-strategy")).to_have_text("Pro rata")
    expect(game_1.get_by_test_id("dispatch-metric-info")).to_have_text(
        "Price maker fees paid • tDAI"
    )
    expect(game_1.get_by_test_id("assessed-over")).to_have_text("15 epochs")
    expect(game_1.get_by_test_id("scope")).to_have_text("Eligible")
    expect(game_1.get_by_test_id("staking-requirement")).to_have_text("-")
    expect(game_1.get_by_test_id("average-position")).to_have_text("1,028.21311")

def test_game_results_page(competitions_page: Tuple[Page, str, VegaServiceNull]):
    page, team_name, vega = competitions_page
    page.goto(COMPETITIONS_URL)
    page.get_by_test_id("active-rewards-card").click()
    expect(page.get_by_test_id("dispatch-metric-info").first).to_have_text("Price maker fees paid • tDAI")
    expect(page.get_by_test_id("epoch-0")).to_have_text("19")
    expect(page.get_by_test_id("rank-0")).to_have_text("1")
    expect(page.get_by_test_id("teamName-0")).to_be_visible()
    expect(page.get_by_test_id("amount-0")).to_have_text("50.00")
    game_card = page.get_by_test_id("active-rewards-card")
    expect(game_card).to_be_visible()
    expect(game_card.get_by_test_id("entity-scope")).to_have_text("Team")
    expect(game_card.get_by_test_id("locked-for")).to_have_text("1 epoch")
    expect(game_card.get_by_test_id("reward-value")).to_have_text("100.00")
    expect(game_card.get_by_test_id("reward-asset")).to_have_text("VEGA")
    expect(game_card.get_by_test_id("distribution-strategy")).to_have_text("Pro rata")
    expect(game_card.get_by_test_id("dispatch-metric-info")).to_have_text(
        "Price maker fees paid • tDAI"
    )
    expect(game_card.get_by_test_id("assessed-over")).to_have_text("15 epochs")
    expect(game_card.get_by_test_id("staking-requirement")).to_have_text("-")
    expect(game_card.get_by_test_id("average-position")).to_have_text("-")
    expect(game_card.get_by_test_id("scope")).to_have_text("All teams")


def test_switch_teams(team_page: Tuple[Page, str, str, VegaServiceNull]):
    page, team_name, team_id, vega = team_page
    change_keys(page, vega, PARTY_B.name)
    page.get_by_test_id("switch-team-button").click()
    page.get_by_test_id("confirm-switch-button").click()
    expect(page.get_by_test_id("dialog-content").first).to_be_visible()
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    page.reload()
    expect(page.get_by_test_id("members-count-stat")).to_have_text("3")

def test_create_team(competitions_page: Tuple[Page, str, VegaServiceNull]):
    page, team_id, vega = competitions_page
    page.goto(COMPETITIONS_URL)
    change_keys(page, vega, MM_WALLET2.name)
    page.get_by_test_id("create-public-team-button").click()
    page.get_by_test_id("team-name-input").fill("e2e")
    page.get_by_test_id("team-url-input").fill("https://vega.xyz")
    page.get_by_test_id("avatar-url-input").fill("http://placekitten.com/200/200")
    page.get_by_test_id("team-form-submit-button").click()
    expect(page.get_by_test_id("team-form-submit-button")).to_have_text(
        "Confirming transaction..."
    )
    vega.wait_fn(2)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id("team-creation-success-message")).to_be_visible()
    expect(page.get_by_test_id("team-id-display")).to_be_visible()
    expect(page.get_by_test_id("team-id-display")).to_be_visible()
    page.get_by_test_id("view-team-button").click()
    expect(page.get_by_test_id("team-name")).to_have_text("e2e")