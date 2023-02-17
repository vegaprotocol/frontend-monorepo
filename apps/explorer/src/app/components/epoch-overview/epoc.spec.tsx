import { render } from '@testing-library/react'
import { IconForEpoch } from './epoch'

const THE_PAST = 'Monday, 17 February 2022 11:44:09'
const THE_FUTURE = 'Monday, 17 February 3023 11:44:09'
    
describe('IconForEpoch', () => {
    it('Handles malformed dates', () => {
        const start = 'This is n0t a d4te'
        const end = '📅'
        const screen = render(<IconForEpoch start={start} end={end} />)

        expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'calendar icon')
    })

    it('defaults to a calendar icon', () => {
        const start = null as unknown as string
        const end = null as unknown as string
        const screen = render(<IconForEpoch start={start} end={end} />)

        expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'calendar icon')
    })

    it('if start and end are both in the future, stick with calendar', () => {
        const screen = render(<IconForEpoch start={THE_FUTURE} end={THE_FUTURE} />)

        expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'calendar icon')
    })

    it('if start is in the past and end is in the future, this is currently active', () => {
        const screen = render(<IconForEpoch start={THE_PAST} end={THE_FUTURE} />)

        expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'circle icon')
    })

    it('if start and end are in the paste, this is done', () => {
        const screen = render(<IconForEpoch start={THE_PAST} end={THE_PAST} />)

        expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'tick-circle icon')
    })
})