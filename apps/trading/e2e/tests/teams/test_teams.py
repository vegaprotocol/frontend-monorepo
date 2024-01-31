import pytest
from playwright.sync_api import expect, Page
import vega_sim.proto.vega as vega_protos
from vega_sim.null_service import VegaServiceNull
from conftest import init_vega
from actions.utils import next_epoch
from fixtures.market import setup_continuous_market
from conftest import auth_setup, init_page, init_vega, risk_accepted_setup
from wallet_config import PARTY_A, PARTY_B, PARTY_C, PARTY_D, MM_WALLET


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
def setup_teams_and_games(vega: VegaServiceNull):
    tDAI_market = setup_continuous_market(vega)
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
    game_end = current_epoch + 11

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
        window_length=10
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
        next_epoch(vega)
        print(f"[EPOCH: {vega.statistics().epoch_seq}] {i} epoch passed")

    return {
        "market_id": tDAI_market,
        "asset_id": tDAI_asset_id,
        "team_id": team_id,
        "team_name": team_name,
    }


def create_team(vega: VegaServiceNull):
    team_name = "Foobar"
    vega.create_referral_set(
        key_name=PARTY_A.name,
        name=team_name,
        team_url="https://vega.xyz",
        avatar_url="http://placekitten.com/200/200",
        closed=False,
    )

    return team_name

def test_team_page_games_table(team_page: Page):
    team_page.get_by_test_id("games-toggle").click()
    expect(team_page.get_by_test_id("games-toggle")).to_have_text("Games (1)")
    expect(team_page.get_by_test_id("rank-0")).to_have_text("1")
    expect(team_page.get_by_test_id("epoch-0")).to_have_text("18")
    expect(team_page.get_by_test_id("type-0")).to_have_text("Price maker fees paid")
    expect(team_page.get_by_test_id("amount-0")).to_have_text("100,000,000")
    expect(team_page.get_by_test_id("participatingTeams-0")).to_have_text(
        "1"
    )
    expect(team_page.get_by_test_id("participatingMembers-0")).to_have_text(
        "2"
    )

def test_team_page_members_table(team_page: Page):
    team_page.get_by_test_id("members-toggle").click()
    expect(team_page.get_by_test_id("members-toggle")).to_have_text("Members (3)")
    expect(team_page.get_by_test_id("referee-0")).to_be_visible()
    expect(team_page.get_by_test_id("joinedAt-0")).to_be_visible()
    expect(team_page.get_by_test_id("joinedAtEpoch-0")).to_have_text("8")

def test_team_page_headline(team_page: Page, setup_teams_and_games
):
    team_name = setup_teams_and_games["team_name"]
    expect(team_page.get_by_test_id("team-name")).to_have_text(team_name)
    expect(team_page.get_by_test_id("members-count-stat")).to_have_text("3")

    expect(team_page.get_by_test_id("total-games-stat")).to_have_text(
        "1"
    )

    # TODO this still seems wrong as its always 0
    expect(team_page.get_by_test_id("total-volume-stat")).to_have_text(
        "0"
    )

    expect(team_page.get_by_test_id("rewards-paid-stat")).to_have_text(
        "100m"
    )

@pytest.fixture(scope="module")
def competitions_page(vega, browser, request):
    with init_page(vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega, page)
        yield page

def test_leaderboard(competitions_page: Page, setup_teams_and_games):
    team_name = setup_teams_and_games["team_name"]
    competitions_page.goto(f"/#/competitions/")
    expect(competitions_page.get_by_test_id("rank-0").locator(".text-yellow-300")).to_have_count(1)
    expect(competitions_page.get_by_test_id("team-0")).to_have_text(team_name)
    expect(competitions_page.get_by_test_id("status-0")).to_have_text("Open")

    expect(competitions_page.get_by_test_id("earned-0")).to_have_text("100,000,000")
    expect(competitions_page.get_by_test_id("games-0")).to_have_text("1")

    # TODO  still odd that this is 0
    expect(competitions_page.get_by_test_id("volume-0")).to_have_text("-")

#TODO def test_games(competitions_page: Page):
#TODO currently no games appear which i think is a bug
