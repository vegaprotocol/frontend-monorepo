import { Then } from 'cypress-cucumber-preprocessor/steps';
import PortfolioPage from '../pages/portfolio-page';

const portfolioPage = new PortfolioPage();

Then('I navigate to portfolio page', () => {
  portfolioPage.navigateToPortfolio();
});
