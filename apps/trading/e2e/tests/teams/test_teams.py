import pytest
from playwright.sync_api import expect, Page
from vega_sim.null_service import VegaServiceNull
from vega_sim.proto.vega.commands.v1.commands_pb2 import (
    CreateReferralSet
)

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_teams(vega: VegaServiceNull, page: Page):

    # submit_transaction will fail with spam statistics error if block height is 0
    # so go forward at least one block
    vega.wait_fn(1)

    team = CreateReferralSet.Team(
        name="Foobar",
        team_url="https://vega.xyz",
        avatar_url="http://placekitten.com/200/200",
        closed=False
    )
    command = CreateReferralSet(
        is_team=True,
        team=team,
    )


    vega.wallet.submit_transaction(
        transaction=command,
        key_name="Key 1",
        transaction_type="createReferralSet",
        wallet_name="MarketSim"
    )

    vega.wait_fn(1)
    vega.forward("10s")
    vega.wait_for_total_catchup()

    # would be better to derive the team id from the signature if possible but
    # vega.submit_transaction does not return anything
    teams = vega.list_teams()

    team_id = list(teams.keys())[0] # list_teams actually returns a dictionary {"team_id": Team}


    print("========================================================")
    print(f"teams: {teams}")
    print(f"team_id: {team_id}")

    page.goto(f"/#/competitions/team/{team_id}")
    expect(page.get_by_role('heading', level=1)).to_have_text(team.name)
