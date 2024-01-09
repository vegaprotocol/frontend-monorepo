import pytest
from playwright.sync_api import expect, Page
from vega_sim.null_service import VegaServiceNull
from vega_sim.proto.vega.commands.v1.commands_pb2 import (
    CreateReferralSet,
    JoinTeam
)
from actions.utils import next_epoch
from wallet_config import PARTY_A, PARTY_B, PARTY_C, PARTY_D

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_teams(vega: VegaServiceNull, page: Page):
    # submit_transaction will fail with spam statistics error if block height is 0
    # so go forward at least one block
    vega.wait_fn(1)

    for key in [PARTY_A, PARTY_B, PARTY_C, PARTY_D]:
        vega.create_key(key.name)

    team = create_team(vega)

    next_epoch(vega)
    # vega.wait_fn(1)
    # vega.forward("10s")
    # vega.wait_for_total_catchup()

    # would be better to derive the team id from the signature if possible but
    # vega.submit_transaction does not return anything
    teams = vega.list_teams()

    # list_teams actually returns a dictionary {"team_id": Team}
    team_id = list(teams.keys())[0]

    add_team_member(vega, PARTY_B.name, team_id)

    # go to next epoch so we can check joinedAt and joinedAtEpoch appropriately
    next_epoch(vega)

    add_team_member(vega, PARTY_C.name, team_id)

    next_epoch(vega)

    add_team_member(vega, PARTY_D.name, team_id)

    vega.wait_fn(1)
    vega.forward("10s")
    vega.wait_for_total_catchup()

    print("========================================================")
    print(f"teams: {teams}")
    print(f"team_id: {team_id}")

    page.goto(f"/#/competitions/team/{team_id}")
    expect(page.get_by_role('heading', level=1)).to_have_text(team.name)
    page.pause()

def create_team(vega: VegaServiceNull):
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
        key_name=PARTY_A.name,
        transaction_type="createReferralSet",
        wallet_name="MarketSim"
    )

    return team

def add_team_member(vega: VegaServiceNull, key_name: str, teamId: str):
    command = JoinTeam(
      id=teamId
    )

    vega.wallet.submit_transaction(
        transaction=command,
        key_name=key_name,
        transaction_type="joinTeam",
        wallet_name="MarketSim"
    )

