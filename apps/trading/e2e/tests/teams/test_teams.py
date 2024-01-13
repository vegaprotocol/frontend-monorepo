import pytest
from playwright.sync_api import expect, Page
from vega_sim.null_service import VegaServiceNull
from actions.utils import next_epoch
from wallet_config import PARTY_A, PARTY_B, PARTY_C, PARTY_D

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_teams(vega: VegaServiceNull, page: Page):

    # submit_transaction will fail with spam statistics error if block height is 0
    # so go forward at least one block
    vega.wait_fn(1)

    for key in [PARTY_A, PARTY_B, PARTY_C, PARTY_D]:
        vega.wallet.create_key(key.name)

    team_name = create_team(vega)

    next_epoch(vega)

    # would be better to derive the team id from the signature if possible but
    # vega.submit_transaction does not return anything
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
    vega.forward("10s")
    vega.wait_for_total_catchup()

    page.goto(f"/#/competitions/team/{team_id}")
    expect(page.get_by_role('heading', level=1)).to_have_text(team_name)
    expect(page.get_by_text('Members (3)')).to_be_visible()

def create_team(vega: VegaServiceNull):
    team_name = "Foobar"

    vega.create_referral_set(
        key_name=PARTY_A.name,
        name=team_name,
        team_url="https://vega.xyz",
        avatar_url="http://placekitten.com/200/200",
        closed=False
    )

    return team_name
