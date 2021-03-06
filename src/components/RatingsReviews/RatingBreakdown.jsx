import React from "react";
import ShowStars from "../OverlapWork/ShowStars";
import Axios from "axios";
import BarBreakdown from "./BarBreakdown";
import ProductBreakdown from "./PruductBreakDown";

import RatesFilter from "./RatesFilter";
class RatingBreakdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 0,
      recommend: 0,
      pairArr: [],
      sum: 0,
      count: 0,
      rates: [],
      showCleanAll: false,
      characteristics: []
    };
    this.HandleRateFilter = this.HandleRateFilter.bind(this);
    this.DeleteAllfilter = this.DeleteAllfilter.bind(this);
  }
  componentDidMount() {
    this.GetReviewMet();
  }
  DeleteAllfilter() {
    this.setState({ rates: [], showCleanAll: false }, () => {
      this.props.GetStarFilter(this.state.rates);
    });
  }
  HandleRateFilter(rate) {
    let tempt = this.state.rates;
    if (tempt.indexOf(rate) === -1) {
      tempt.push(rate);
    } else {
      tempt.splice(tempt.indexOf(rate), 1);
    }
    this.setState({ rate: tempt }, () => {
      this.props.GetStarFilter(this.state.rates);
      if (this.state.rates.length === 0) {
        this.setState({ showCleanAll: false });
      } else {
        this.setState({ showCleanAll: true });
      }
    });
  }
  GetReviewMet() {
    let productId = this.props.productId || 3
    let count = 0;
    let sum = 0;

    let pairArr =[]
    Axios.get(`http://18.224.200.47/reviews/${productId}/meta`)

      .then(response => {
        //get recommend percentage
        //change object to array
        var characteristics = Object.keys(response.data.characteristics).map(
          function(key) {
            return [key, response.data.characteristics[key]];
          }
        );
        // console.log(characteristics);
        const recommends = response.data.recommended;
        const recommendSum = recommends["0"] + recommends["1"];
        const recommend = recommends["1"];
        const recommendPercen =
          Math.round((recommend / recommendSum) * 10) * 10;
        //get allratings
        const AllRatings = response.data.ratings;
        for (let val in AllRatings) {
          let EachArr = [];
          EachArr.push(val, AllRatings[val]);
          sum += val * AllRatings[val];
          count += AllRatings[val];
          pairArr.push(EachArr);
        }
        const rating = sum / count;
        //get the one round number
        const roundedRating = Math.round(rating * 10) / 10;
        this.props.GetTotalCount(count);
        this.setState({
          rating: roundedRating,
          recommend: recommendPercen,
          sum: sum,
          pairArr: pairArr,
          count: count,
          characteristics: characteristics
        });
        let reviews = this.state.count;

        window.localStorage.setItem("reviews", JSON.stringify(reviews));
      })
      .catch(err => console.log(err));
  }
  render() {
    return (

      <div style={{ "height": "100%" }}>
        <div className="row " style={{ "height": "10%" }}>
          <div className="col-4  "><h1>{this.state.rating}</h1></div> <div className="col-8 "><ShowStars productId = {this.props.productId}/></div>

        </div>
        <div className="row " style={{ height: "5%" }}>
          <p>Total Reviews:</p>{" "}
          <div className="col-6" id="totalReviews">
            <strong ml-10="true">{this.state.count}</strong>
          </div>
        </div>
        <div className="row " style={{ height: "5%" }}>
          <p> {this.state.recommend || 0}% of reviews recommend this product</p>
        </div>
        <div className="row " style={{ height: "20%" }}>
          <BarBreakdown
            HandleRateFilter={this.HandleRateFilter}
            count={this.state.count}
            pairArr={this.state.pairArr}
          />
        </div>
        <div className="row mt-5" style={{ height: "5%" }}>
          <RatesFilter rates={this.state.rates} />
        </div>
        <div className="row justify-content-end " style={{ height: "5%" }}>
          {this.state.showCleanAll ? (
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={this.DeleteAllfilter}
            >
              Remove All Filters
            </button>
          ) : null}
        </div>
        <div className="row">
          <ProductBreakdown characteristics={this.state.characteristics} />
        </div>
      </div>
    );
  }
}
export default RatingBreakdown;
