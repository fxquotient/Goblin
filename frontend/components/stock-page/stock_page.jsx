import React from 'react';
import { fetchChart } from '../../util/external_api_util';
import PortfolioChart from './portfolio-chart';
import {fetchCurrentPrice} from '../../util/external_api_util';

class StockPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            newsData: null,
            price: 0,
            color: null,
            ticker: this.props.ticker,
            interval: '1Y',
            buyOrSell: 'Buy',
            buySellStockAmt: 0,
            currentPrice: 0,
        };
    }

    componentDidMount() {
        this.props.fetchPortfolios();
        this.props.fetchNews();
        fetchCurrentPrice(this.props.ticker).then(res => this.setState({currentPrice: res}));
        fetchChart(this.state.ticker, this.state.interval)
            .then(res => this.setState({ data: res }))
            .then(res => this.setState({
                color: [
                    (this.state.data[this.state.data.length - 1].close < this.state.data[0].close) ?
                        "#f1563a" : "#30cd9a"]
            }
            ));
    }

    componentDidUpdate(_prevProps, prevState) {
        if (prevState.interval !== this.state.interval) {
        fetchChart(this.state.ticker, this.state.interval)
            .then(res => this.setState({ data: res }))
            .then(res => this.setState({
                color: [
                    (this.state.data[this.state.data.length - 1].close < this.state.data[0].close) ?
                        "#f1563a" : "#30cd9a"]
            }
            ));
        }
    }

    onChangeInterval(value) {
        this.setState({interval: value});
    }

    onInputChange() {
        return e => this.setState({buySellStockAmt: e.currentTarget.value});
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
                        <li><a onClick={() => this.onChangeInterval('1D')}>{'1D'}</a></li>
                        <li><a onClick={() => this.onChangeInterval('1M')}>{'1M'}</a></li>
                        <li><a onClick={() => this.onChangeInterval('3M')}>{'3M'}</a></li>
                        <li><a onClick={() => this.onChangeInterval('1Y')}>{'1Y'}</a></li>
                    </div>
                </div>


                <div className="stock-sidebar-main">
                    <div className="buy-sell-option">
                        <a className="buy-word"
                        >Buy {this.props.ticker}
                        </a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a 
                        className="sell-word"
                        >Sell {this.props.ticker}</a>
                    </div>
                    <div className="stock-shares-input">
                        <label>Trade Shares
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
                    <button className="place-order-btn">Place Order</button>
                </div>


                <div className="portfolio-news-main">
                    <h3 className="news-section-title">Recent News</h3>
                    <ul className="news-feed">
                        {this.props.newsArticles.map((article, idx) => {
                            return (
                                <a key={idx} className="news-line-item" href={article.url}>
                                    <img className="news-photo" src={article.urlToImage}></img>
                                    <div className="news-content">
                                        <p className="news-article-title">
                                            {article.title}
                                        </p>
                                        <p className="news-article-description">
                                            {article.description}
                                        </p>
                                    </div>
                                </a>
                            )
                        })}
                    </ul>
                </div>
            </div>
        )
    }
}

export default StockPage;