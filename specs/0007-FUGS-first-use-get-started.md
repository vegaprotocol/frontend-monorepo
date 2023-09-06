# First use & get started steps

## "Onboarding" state is gradable and has following steps: (<a name="0007-FUGS-002" href="#0007-FUGS-002">0007-FUGS-003</a>)

- New visitor - has no wallet nor any dapps running.
  - I **must** see CTA button "Get started", which clicking launches the get wallet flow (wallet connection window with links to the Chrome and FF stores)
- Has wallet - Once wallet detected set to this.
  - I **must** see CTA button "Connect", which clicking launches the wallet connection
- Has connected - Once user has connected set to this.
  - I **must** see CTA button "Deposit", which clicking launches the deposit ticket.
- Has deposited - Once user has made AT LEAST one deposit of ANY settlement asset set to this.
  - I **must** see CTA button "Dismiss", which clicking updates the state to Ready to trade - Get started box should now disappear forever.
- Ready to trade - Once user has made at least one deposit AND has dismissed the "Get Started" box in the ticket.
  - Onboarding window nor contextual "Get started" banner should be not displayed anymore.

## When first enter the app or next times, but I didn't accomplish all onboarding steps.

- **Must** When I open Console for the first time I can see what it is i.e. a short description and key features in auto opened dialog window (first use popup) (<a name="0007-FUGS-001" href="#0007-FUGS-001">0007-FUGS-001</a>)
- If full "onboarding" hasn't been accomplished yet, I **must** see the popup with my progress marked. (<a name="0007-FUGS-002" href="#0007-FUGS-002">0007-FUGS-002</a>)
- **Must** There is a call to action to browse markets, linking to the market view market/all (<a name="0007-FUGS-005" href="#0007-FUGS-005">0007-FUGS-005</a>)
- **Must** I can see the steps I need to take to get started trading (<a name="0007-FUGS-007" href="#0007-FUGS-006">0007-FUGS-006</a>)
- **Must** There is a call to action to get started, triggering the connect modal (<a name="0007-FUGS-007" href="#0007-FUGS-007">0007-FUGS-007</a>)
- **Must** There is a link to try out trading on Fairground when I'm on Mainnet (<a name="0007-FUGS-008" href="#0007-FUGS-008">0007-FUGS-008</a>)
- **Must** There is a link to trade with real funds on Mainnet when I am on Fairground (<a name="0007-FUGS-010" href="#0007-FUGS-010">0007-FUGS-010</a>)
- **Must** When I am on the Fairground version, I can see a warning / call out that this is Fairground meaning I can try out with virtual assets at no risk (<a name="0007-FUGS-011" href="#0007-FUGS-011">0007-FUGS-011</a>)
- If I dismiss the popup, I **must** not see it anymore (<a name="0007-FUGS-018" href="#0007-FUGS-018">0007-FUGS-018</a>)
- If I dismiss the popup, I land on the default market (<a name="0007-FUGS-012" href="#0007-FUGS-012">0007-FUGS-012</a>)

## When the popup has been dismissed:

- **Must** I can see the steps to get started with a visible call to action (according to my progress) in the context of the deal ticket, deposit, withdraw, transfer components in the sidebar (<a name="0007-FUGS-013" href="#0007-FUGS-013">0007-FUGS-013</a>)
- **Must** We've replaced "connect wallet" in the top right with "get started" (<a name="0007-FUGS-014" href="#0007-FUGS-014">0007-FUGS-014</a>)
- **Must** When I press the get started CTA, I see the wallet connect popup (<a name="0007-FUGS-015" href="#0007-FUGS-015">0007-FUGS-015</a>)
- **Must** If I have a wallet installed already I don't see this quick start onboarding, and instead call(s) to action in Console revert to connect wallet, not "get started" (button in nav header) (<a name="0007-FUGS-016" href="#0007-FUGS-016">0007-FUGS-016</a>)

## When onboarding process has been accomplished:

- I can see telemetry approval toast: on environment other than mainnet telemetry is enabled by default (<a name="0007-FUGS-018" href="#0007-FUGS-018">0007-FUGS-018</a>)
