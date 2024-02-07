import pytest
from playwright.sync_api import expect, Page
import vega_sim.proto.vega as vega_protos
from vega_sim.null_service import VegaServiceNull
from conftest import init_vega
from actions.utils import next_epoch, change_keys, create_and_faucet_wallet
from fixtures.market import setup_continuous_market
from conftest import auth_setup, init_page, init_vega, risk_accepted_setup
from wallet_config import  MM_WALLET, WalletConfig

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def team_page(vega, browser, request, setup_teams_and_games):
    with init_page(vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega, page)
        team_id = setup_teams_and_games["team_id"]
        page.goto(f"/#/competitions/teams/{team_id}")
        yield page


@pytest.fixture(scope="module")
def competitions_page(vega, browser, request, setup_teams_and_games):
    with init_page(vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega, page)
        team_id = setup_teams_and_games["team_id"]
        page.goto(f"/#/competitions/")
        yield page


@pytest.fixture(scope="module")
def setup_teams_and_games(vega: VegaServiceNull):
    tDAI_market = setup_continuous_market(vega, custom_quantum=100000)
    PARTY_A = WalletConfig("PARTY_A", "PARTY_A")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_A)
    PARTY_B = WalletConfig("PARTY_B", "PARTY_B")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_B)
    PARTY_C = WalletConfig("PARTY_C", "PARTY_C")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_C)
    PARTY_D = WalletConfig("PARTY_D", "PARTY_D")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_D)
    vega.wait_fn(10)
    vega.wait_for_total_catchup()

    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_C.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_A.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_D.name, asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)

    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )

    next_epoch(vega=vega)
    team_name = create_team(vega)

    next_epoch(vega)
    teams = vega.list_teams()

    # list_teams actually returns a dictionary {"team_id": Team}
    team_id = list(teams.keys())[0]
    vega.create_referral_set(
        key_name="market_maker",
        name="test",
        team_url="https://vega.xyz",
        avatar_url="http://placekitten.com/200/200",
        closed=False,
    )
    next_epoch(vega)
    teams = vega.list_teams()

    team_id_2 = list(teams.keys())[0]
    vega.apply_referral_code("Key 1", team_id_2)

    vega.apply_referral_code(PARTY_B.name, team_id)

    # go to next epoch so we can check joinedAt and joinedAtEpoch appropriately
    next_epoch(vega)

    vega.apply_referral_code(PARTY_C.name, team_id)

    next_epoch(vega)

    vega.apply_referral_code(PARTY_D.name, team_id)

    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    current_epoch = vega.statistics().epoch_seq
    game_start = current_epoch + 1
    game_end = current_epoch + 14

    current_epoch = vega.statistics().epoch_seq
    print(f"[EPOCH: {current_epoch}] creating recurring transfer")
    print(f"Game start: {game_start}")
    print(f"Game game end: {game_end}")

    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
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
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    vega.recurring_transfer(
        from_key_name=PARTY_B.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        entity_scope=vega_protos.vega.ENTITY_SCOPE_INDIVIDUALS,
        individual_scope=vega_protos.vega.INDIVIDUAL_SCOPE_IN_TEAM,
        n_top_performers=1,
        amount=100,
        factor=1.0,
        window_length=15
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    vega.recurring_transfer(
        from_key_name=PARTY_C.name,
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
        vega.submit_order(
            trading_key="Key 1",
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.submit_order(
            trading_key="market_maker",
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
        key_name="PARTY_A",
        name=team_name,
        team_url="https://vega.xyz",
        avatar_url="http://placekitten.com/200/200",
        closed=False,
    )

    return team_name

@pytest.mark.xdist_group(name="test_teams")
def test_team_page_games_table(team_page: Page):
    team_page.get_by_test_id("games-toggle").click()
    expect(team_page.get_by_test_id("games-toggle")).to_have_text("Games (1)")
    expect(team_page.get_by_test_id("rank-0")).to_have_text("2")
    expect(team_page.get_by_test_id("epoch-0")).to_have_text("19")
    expect(team_page.get_by_test_id("type-0")
           ).to_have_text("Price maker fees paid")
    expect(team_page.get_by_test_id("amount-0")).to_have_text("74")
    expect(team_page.get_by_test_id("participatingTeams-0")).to_have_text("2")
    expect(team_page.get_by_test_id("participatingMembers-0")).to_have_text("4")

@pytest.mark.xdist_group(name="test_teams")
def test_team_page_members_table(team_page: Page):
    team_page.get_by_test_id("members-toggle").click()
    expect(team_page.get_by_test_id("members-toggle")
           ).to_have_text("Members (4)")
    expect(team_page.get_by_test_id("referee-0")).to_be_visible()
    expect(team_page.get_by_test_id("joinedAt-0")).to_be_visible()
    expect(team_page.get_by_test_id("joinedAtEpoch-0")).to_have_text("9")

@pytest.mark.xdist_group(name="test_teams")
def test_team_page_headline(team_page: Page, setup_teams_and_games):
    team_name = setup_teams_and_games["team_name"]
    expect(team_page.get_by_test_id("team-name")).to_have_text(team_name)
    expect(team_page.get_by_test_id("members-count-stat")).to_have_text("4")

    expect(team_page.get_by_test_id("total-games-stat")).to_have_text("2")

    # TODO this still seems wrong as its always 0
    expect(team_page.get_by_test_id("total-volume-stat")).to_have_text("0")

    expect(team_page.get_by_test_id("rewards-paid-stat")).to_have_text("214")

@pytest.mark.xdist_group(name="test_teams")
def test_switch_teams(team_page: Page, vega: VegaServiceNull):
    team_page.get_by_test_id("switch-team-button").click()
    team_page.get_by_test_id("confirm-switch-button").click()
    expect(team_page.get_by_test_id("dialog-content").first).to_be_visible()
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    team_page.reload()
    expect(team_page.get_by_test_id("members-count-stat")).to_have_text("5")

@pytest.mark.xdist_group(name="test_teams")
def test_leaderboard(competitions_page: Page, setup_teams_and_games):
    team_name = setup_teams_and_games["team_name"]
    competitions_page.reload()
    expect(
        competitions_page.get_by_test_id("rank-0").locator(".text-yellow-300")
    ).to_have_count(1)
    expect(
        competitions_page.get_by_test_id(
            "rank-1").locator(".text-vega-clight-500")
    ).to_have_count(1)
    expect(competitions_page.get_by_test_id("team-1")).to_have_text(team_name)
    expect(competitions_page.get_by_test_id("status-1")).to_have_text("Open")

    #  FIXME: the numbers are different we need to clarify this with the backend
    # expect(competitions_page.get_by_test_id("earned-1")).to_have_text("160")
    expect(competitions_page.get_by_test_id("games-1")).to_have_text("2")

    # TODO  still odd that this is 0
    expect(competitions_page.get_by_test_id("volume-0")).to_have_text("-")

@pytest.mark.xdist_group(name="test_teams")
def test_game_card(competitions_page: Page):
    expect(competitions_page.get_by_test_id(
        "active-rewards-card")).to_have_count(2)
    game_1 = competitions_page.get_by_test_id("active-rewards-card").first
    expect(game_1).to_be_visible()
    expect(game_1.get_by_test_id("entity-scope")).to_have_text("Individual")
    expect(game_1.get_by_test_id("locked-for")).to_have_text("1 epoch")
    expect(game_1.get_by_test_id("reward-value")).to_have_text("100.00")
    expect(game_1.get_by_test_id("distribution-strategy")
           ).to_have_text("Pro rata")
    expect(game_1.get_by_test_id("dispatch-metric-info")
           ).to_have_text("Price maker fees paid • ")
    expect(game_1.get_by_test_id("assessed-over")).to_have_text("15 epochs")
    expect(game_1.get_by_test_id("scope")).to_have_text("In team")
    expect(game_1.get_by_test_id("staking-requirement")).to_have_text("0.00")
    expect(game_1.get_by_test_id("average-position")).to_have_text("0.00")

@pytest.mark.xdist_group(name="test_teams")
def test_create_team(competitions_page: Page, vega: VegaServiceNull):
    change_keys(competitions_page, vega, "market_maker_2")
    competitions_page.get_by_test_id("create-public-team-button").click()
    competitions_page.get_by_test_id("team-name-input").fill("e2e")
    competitions_page.get_by_test_id("team-url-input").fill("https://vega.xyz")
    competitions_page.get_by_test_id("avatar-url-input").fill(
        "http://placekitten.com/200/200"
    )
    competitions_page.get_by_test_id("team-form-submit-button").click()
    expect(competitions_page.get_by_test_id("team-form-submit-button")).to_have_text(
        "Confirming transaction..."
    )
    vega.wait_fn(2)
    vega.wait_for_total_catchup()
    expect(
        competitions_page.get_by_test_id("team-creation-success-message")
    ).to_be_visible()
    expect(competitions_page.get_by_test_id("team-id-display")).to_be_visible()
    expect(competitions_page.get_by_test_id("team-id-display")).to_be_visible()
    competitions_page.get_by_test_id("view-team-button").click()
    expect(competitions_page.get_by_test_id("team-name")).to_have_text("e2e")
