import { Then } from 'cypress-cucumber-preprocessor/steps';
import PortfolioPage from '../pages/portfolio-page';

const portfolioPage = new PortfolioPage();

Then('I can navigate to the portfolio page', () => {
  portfolioPage.navigateToPortfolio();
});
