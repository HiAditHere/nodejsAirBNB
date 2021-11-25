import React, {useState, useEffect} from "react";
import hostDataService from "../services/hosts";
import { Link } from "react-router-dom";

const Host = props => {
  const initialHostState = {
    id: null,
    name: "",
    address: {},
    property_type: "",
    reviews: [],
    url: "",
  };

  const [host, setHost] = useState(initialHostState);

  const getHost = id => {
    hostDataService.get(id)
    .then(response => {
      setHost(response.data);
      console.log(response.data);
    })
    .catch(e =>{
      console.log(e);
    });
  };

  useEffect(() => {
    getHost(props.match.params.id);
  }, [props.match.params.id]);

  const deleteReview = (reviewId, index) => {
    hostDataService.deleteReview(reviewId, props.user.id)
    .then(response => {
      setHost((prevState) => {
        prevState.reviews.splice(index, 1);
        return({
          ...prevState
        })
      })
    })
    .catch(e => {
      console.log(e);
    });
  };

  //<img src={props.images.picture_url} class="img-fluid" alt="..."/>
  return (
    <div>
      {host ? (
        <div>
           
          <h5>{host.name}</h5>
          <p>
            <strong>property_type: </strong>{host.property_type}<br/>
            <strong>Address: </strong>{host.address.street} {host.address.suburb} {host.address.government_area} {host.address.country}
          </p>
          <Link to={"/hosts/" + props.match.params.id + "/review"} className="btn btn-primary">
            Add Review
          </Link>
          <h4> Reviews </h4>
          <div className="row">
            {host.reviews.length > 0 ? (
             host.reviews.map((review, index) => {
               return (
                 <div className="col-lg-4 pb-1" key={index}>
                   <div className="card">
                     <div className="card-body">
                       <p className="card-text">
                         {review.text}<br/>
                         <strong>User: </strong>{review.name}<br/>
                         <strong>Date: </strong>{review.date}
                       </p>
                       {props.user && props.user.id === review.user_id &&
                          <div className="row">
                            <a onClick={() => deleteReview(review._id, index)} className="btn btn-primary col-lg-5 mx-1 mb-1">Delete</a>
                            <Link to={{
                              pathname: "/hosts/" + props.match.params.id + "/review",
                              state: {
                                currentReview: review
                              }
                            }} className="btn btn-primary col-lg-5 mx-1 mb-1">Edit</Link>
                          </div>                   
                       }
                     </div>
                   </div>
                 </div>
               );
             })
            ) : (
            <div className="col-sm-4">
              <p>No reviews yet.</p>
            </div>
            )}

          </div>

        </div>
      ) : (
        <div>
          <br />
          <p>No host selected.</p>
        </div>
      )}
    </div>
  );
};

export default Host;