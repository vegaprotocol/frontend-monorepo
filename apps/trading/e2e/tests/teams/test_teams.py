import pytest
from playwright.sync_api import expect, Page
import vega_sim.proto.vega as vega_protos
from vega_sim.null_service import VegaServiceNull
from conftest import init_vega
from actions.utils import next_epoch
from fixtures.market import setup_continuous_market
from wallet_config import PARTY_A, PARTY_B, PARTY_C, PARTY_D, MM_WALLET


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


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
    next_epoch(vega=vega)
    return tDAI_market, tDAI_asset_id, team_id, team_name


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_teams(vega: VegaServiceNull, page: Page):
    market_id, asset_id, team_id, team_name = setup_teams_and_games(vega)
    page.goto(f"/#/competitions/teams/{team_id}")
    # page.pause()
    expect(page.get_by_role("heading", level=1)).to_have_text(team_name)
    expect(page.get_by_text("Members (3)")).to_be_visible()


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
