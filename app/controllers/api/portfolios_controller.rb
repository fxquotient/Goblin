class Api::PortfoliosController < ApplicationController
    def index
        @portfolios = Portfolio.all
    end

    def create
        @portfolio = Portfolio.new(portfolio_params)
        if @portfolio.save
            render :index
        else 
            render json: @portfolio.errors.full_messages, status: 401
        end
    end

    def update
        @portfolio = Portfolio.find_by(user_id: params[:portfolio][:user_id], stock_id: params[:portfolio][:stock_id])
        if @portfolio.update(portfolio_params)
            render :index
        else
            render json: @portfolio.errors.full_messages, status: 401
        end
    end

    def portfolio_params
        params.require(:portfolio).permit(:user_id, :stock_id, :num_shares)
    end
end
