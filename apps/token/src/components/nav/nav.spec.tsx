import { render, screen } from "@testing-library/react"
import { EnvironmentProvider, Networks } from "@vegaprotocol/environment"
import { MemoryRouter } from "react-router-dom"
import { Nav } from './nav'

jest.mock('@vegaprotocol/environment', () => ({
    ...jest.requireActual('@vegaprotocol/environment'),
    NetworkSwitcher: () => <div data-testid="network-switcher" />
}))

const renderComponent = () => {
    return render(<EnvironmentProvider
        definitions={{  VEGA_ENV: Networks.MAINNET }}
        config={{ hosts: [] }}
      ><MemoryRouter><Nav /></MemoryRouter>
      </EnvironmentProvider>)
}

describe('nav', () => {
    it('Renders title and logo with link to home', () => {
        renderComponent()
        expect(screen.getByText('Governance')).toBeInTheDocument()
        expect(screen.getByTestId('logo-link')).toHaveProperty('href', 'http://localhost/')
    })
    it('Renders network switcher', () => {
        renderComponent()
        expect(screen.getByTestId('network-switcher')).toBeInTheDocument()
    })
    // it('Renders environment name', () => {
        
    // })
    // it('Renders all top level routes', () => {

    // })
    // it('Redirects to the appropriate page when clicking on a top level link', () => {

    // })
    // it('Renders dropdown', () => {

    // })
    // it('Redirects when clickin on route in dropdown', () => {

    // })
    // it('Shows active state on dropdown trigger when on home route', () => {

    // })
    // it('Shows active state on dropdown trigger when on sub route of dropdown', () => {

    // })
})