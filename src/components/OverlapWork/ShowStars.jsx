import Axios from "axios";
import React from "react"
//help function
const TranverStar = star => {
  const Int = parseInt(star)
  const modul = star - Int
  let ratingPercen
  if (modul >= 0 & modul < 0.125) {
    ratingPercen = Int
  } else if (modul >= 0.125 & modul < 0.375) {
    ratingPercen = Int + 0.48
  }else if (modul >= 0.375  & modul< 0.625) {
    ratingPercen = Int + 0.6
  }else if (  modul >= 0.625 & modul< 0.875) {
    ratingPercen = Int + 0.7
  }else {
    ratingPercen = Int + 1
  }
  ratingPercen = 20 * ratingPercen
  return ratingPercen
}
class ShowStars extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      rating: 0,
      ratingPercen:0
    }
  }
  componentDidMount() {
    this.GetReviewMet()
  }
  GetReviewMet(product_id = 3) {
    let count = 0;
    let sum = 0
    if (this.props.star) {

    }
    Axios.get(`http://3.134.102.30/reviews/${product_id}/meta`)
      .then(response => {
        const AllRatings = response.data.ratings
        for (let val in AllRatings) {
          sum += val * AllRatings[val];
          count += AllRatings[val]
        }
        const rating = sum /count
        //get the one round number
        const roundedRating = Math.round(rating * 10) / 10
        //get percentage
        //first get the number whose denominator is five
        const ratingPercen = TranverStar(rating)
        //get int part

        this.setState({rating:roundedRating,ratingPercen:ratingPercen})
      }
      )
    .catch(err =>console.log(err)
    )
  }
  render() {
    return (
      <div className="progress border-0" style={{"height":"30"},{"width":"50%"}}>
        <div className="progress-bar progress-bar-striped progress-bar-animated  " style={{ "width": `${this.state.ratingPercen}%` }} role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" ><img style={{ "border": "hidden" }}className="grade-star-img "></img></div>
</div>

    )

  }
}

export default ShowStars