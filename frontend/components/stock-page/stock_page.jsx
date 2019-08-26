import React from 'react';
import { fetchChart, fetchIntraday } from '../../util/external_api_util';
import PortfolioChart from './portfolio-chart';
import {fetchCurrentPrice} from '../../util/external_api_util';
import {createStock, updatePortfolio, 
        createPortfolio, createTransaction,
        } from '../../util/transaction_api_util';

class StockPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            price: 0,
            color: null,
            ticker: this.props.ticker,
            interval: '1y',
            buySellStockAmt: 0,
            currentPrice: 0,
            currentShares: 0,
            buyOption: true,
        };
    }

    componentDidMount() {
        this.props.fetchPortfolios();
        this.props.fetchNews();
        this.props.fetchStocks();
        fetchCurrentPrice(this.state.ticker).then(res => this.setState({currentPrice: res, price: res}));
        this.fetchChartNormal(this.state.ticker, this.state.interval);
    }

    componentDidUpdate(_prevProps, prevState) {
        const {portfolioStock} = this.props;
        if (portfolioStock && portfolioStock.num_shares !== prevState.currentShares) {
            this.setState({ currentShares: portfolioStock.num_shares });
        } else if (!portfolioStock && prevState.currentShares) {
            this.setState({ currentShares: 0 });
        }
        if (!(this.props.ticker in this.props.stocks)) {
            createStock({ ticker: this.props.ticker });
            this.props.fetchStocks();
        }
        if (prevState.interval !== this.state.interval) {
            this.loadChartByInterval(this.state.interval, this.state.ticker);
        }
        if (_prevProps.ticker !== this.props.ticker) {
            fetchCurrentPrice(this.props.ticker).then(res => this.setState({ currentPrice: res, price: res }));
            this.loadChartByInterval(this.state.interval, this.props.ticker);
        }
    }

    onChangeInterval(value) {
        this.setState({interval: value});
    }

    loadChartByInterval(interval, ticker) {
        if (interval === '1d') {
            this.fetchChartDaily(ticker);
        } else {
            this.fetchChartNormal(ticker, interval);
        }
    }

    fetchChartDaily(ticker) {
        fetchIntraday(ticker)
            .then(res => this.setState({ data: res }))
            .then(res => this.setState({
                color: [
                    (this.state.data[this.state.data.length - 1].close < this.state.data[0].close) ?
                        "#f1563a" : "#30cd9a"]
            }
            ));
    }

    fetchChartNormal(ticker, interval) {
        fetchChart(ticker, interval)
            .then(res => this.setState({ data: res }))
            .then(res => this.setState({
                color: [
                    (this.state.data[this.state.data.length - 1].close < this.state.data[0].close) ?
                        "#f1563a" : "#30cd9a"]
            }
            ));
    }

    onInputChange() {
        return e => {
            this.setState({buySellStockAmt: e.currentTarget.value});
            this.setState({price: e.currentTarget.value * this.state.currentPrice});
        };
    }

    buySellOptionChange(bool) {
        this.setState({buyOption: bool});
    }

    placeOrder() {
        if (this.state.buyOption) {
            if (this.state.price <= this.props.currentUser.buying_power &&
                            this.state.buySellStockAmt) {
                if (this.state.currentShares) {
                    const numShares = this.state.currentShares +
                        this.state.buySellStockAmt;
                    this.updatePort(
                        this.props.currentUser.id,
                        this.props.portfolioStock.id,
                        numShares
                    );
                } else {
                    createPortfolio({
                      user_id: this.props.currentUser.id,
                      stock_id: this.props.portfolioStock.id,
                      num_shares: this.state.buySellStockAmt,
                    });
                }
                this.createTx(
                  this.props.currentUser.id,
                  this.props.portfolioStock.id,
                  this.state.buySellStockAmt
                );
                this.props.fetchPortfolios();
            }
        } else {
            if (this.state.buySellStockAmt && 
                    this.state.buySellStockAmt <= this.state.currentShares) {
                const numShares = this.state.currentShares -
                    this.state.buySellStockAmt;
                this.updatePort(
                    this.props.currentUser.id,
                    this.props.portfolioStock.id,
                    numShares
                );
            }
            this.createTx(
                this.props.currentUser.id,
                this.props.portfolioStock.id,
                -this.state.buySellStockAmt
            );
            this.props.fetchPortfolios();
        }
    }

    updatePort(userId, stockId, numShares) {
        updatePortfolio({
            user_id: userId,
            stock_id: stockId,
            num_shares: numShares,
        });
    }

    createTx(userId, stockId, stockDiff) {
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        today = '' + yyyy + '-' + mm + '-' + dd;

        createTransaction({
            user_id: userId,
            stock_id: stockId,
            stock_difference: stockDiff,
            transaction_date: today,
        });
    }

    render() {
        const marketPriceStyle = {
            color: this.state.color
        };
        return (
            <div className="home-page-main">

                <div className="portfolio-chart-main">
                    <div className="portfolio-chart-price">
                        <h1>${this.state.currentPrice.toFixed(2)}</h1>
                    </div>
                    <PortfolioChart className="portfolio-chart-chart"
                        data={this.state.data}
                        color={this.state.color}
                    />
                    <div className="stock-chart-time-tags">
                        <li><a onClick={() => this.onChangeInterval('1d')}>{'1D'}</a></li>
                        <li><a onClick={() => this.onChangeInterval('1m')}>{'1M'}</a></li>
                        <li><a onClick={() => this.onChangeInterval('3m')}>{'3M'}</a></li>
                        <li><a onClick={() => this.onChangeInterval('1y')}>{'1Y'}</a></li>
                    </div>
                </div>


                <div className="stock-sidebar-main">
                    <div className="buy-sell-option">
                        <p className="buy-word"
                            onClick={() => this.buySellOptionChange(true)}
                            >Buy {this.props.ticker}
                        </p>
                        <p className="sell-word"
                            onClick={() => this.buySellOptionChange(false)}
                            >Sell {this.props.ticker}
                        </p>
                    </div>
                    <div className="stock-shares-input">
                        <label>{this.state.buyOption ? "Buy" : "Sell"} Shares
                            <input 
                            type="number"
                            value={this.state.buySellStockAmt}
                            min-value={1}
                            onChange={this.onInputChange()}
                            />
                        </label>
                    </div>
                    <div className="stock-market-price">
                        <p className="market-price-word" style={marketPriceStyle}>Market Price</p>
                        <p className="market-price-price">{`$${this.state.currentPrice.toFixed(2)}`}</p>
                    </div>
                    <div className="estimated-cost">
                        <p className="estimated-cost-word">Estimated Cost</p>
                        <p className="estimated-cost-cost">{`$${(this.state.buySellStockAmt * 
                        this.state.currentPrice).toFixed(2)}`}</p>
                    </div>
                    <button className="place-order-btn"
                        onClick={() => this.placeOrder()}
                    >Place Order</button>
                    <p className="buying-power">Buying Power: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    ${this.props.currentUser.buying_power.toFixed(2)}</p>
                </div>


                <div className="portfolio-news-main">
                    <h3 className="news-section-title">Recent News</h3>
                    <ul className="news-feed">
                        {this.props.newsArticles.map((article, idx) => (
                            idx < 10 && !!article.multimedia[3] ? (
                                <a key={idx} className="news-line-item" href={article.url}>
                                    <img className="news-photo" src={article.multimedia[3].url}></img>
                                    <div className="news-content">
                                        <p className="news-article-title">
                                            {article.title}
                                        </p>
                                        <p className="news-article-description">
                                            {article.abstract}
                                        </p>
                                    </div>
                                </a>
                            ) : <></>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }
}

export default StockPage;