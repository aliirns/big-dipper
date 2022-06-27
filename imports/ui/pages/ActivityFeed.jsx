import React, { Component } from "react";
//import Analytics from './ActivityContainer.js';
import { Analytics } from "/imports/api/analytics/analytics.js";
import {
  Container,
  Row,
  Col,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap";
import ActivityGraph from "./ActivityGraph";
import { constrainZoomValues } from "plottable/build/src/interactions/panZoomConstraints";

export default class ActivityFeed extends Component {
  constructor(props) {
    super(props);
    this.toggleAmount = this.toggleAmount.bind(this);
    this.toggleType = this.toggleType.bind(this);
    this.toggleTime = this.toggleTime.bind(this);
    //getting records with limit 1 and offset 1
    Meteor.call("Analytics.getAllRecords", 10, 1, (error, result) => {
      console.log("Analytics.getAllRecords", result);
      if (error) {
        console.log("get Sales Failed: %o", error);
      } else {
        this.setState({ ActivityFeedList: result });
      }
    });
    Meteor.call("Analytics.getSaleOfTheDay", (error, result) => {
      console.log("Analytics.getSaleOfTheDay", result);
      if (error) {
        console.log("get Sales Failed: %o", error);
      } else {
        if (result) {
          this.setState({ saleOfTheDay: result });
        }
      }
    });
    Meteor.call("Analytics.getSaleOfAllTime", (error, result) => {
      console.log("Analytics.getSaleOfAllTime", result);
      if (error) {
        console.log("get Sales Failed: %o", error);
      } else {
        if (result) {
          console.log("get Sales of all time", result);
          this.setState({ saleOfAllTime: result });
        }
      }
    });

    Meteor.call("Analytics.getCreatorOfTheDay", (error, result) => {
      console.log("Analytics.getCreatorOfTheDay", result);
      if (error) {
        console.log("get creator Failed: %o", error);
      } else {
        if (result) {
          this.setState({ creatorOfTheDay: result });
        }
      }
    });

    Meteor.call("Analytics.getCreatorOfAllTime", (error, result) => {
      console.log("getCreatorOfAllTime", result);
      if (error) {
        console.log("get creator Failed: %o", error);
      } else {
        if (result.from != undefined) {
          this.state.creatorOfAllTime = result;
          this.setState({ creatorOfAllTime: result });
        }
      }
    });

    this.state = {
      dropdownAmount: false,
      dropdownType: false,
      dropdownTime: false,
      ActivityFeedList: [],
      saleOfTheDay: {
        amount: "",
        coin: "...",
      },
      saleOfAllTime: {
        amount: "",
        coin: "...",
      },
      creatorOfTheDay: {
        from: "...",
      },
      creatorOfAllTime: {
        from: "...",
      },
    };
  }
  toggleAmount() {
    this.setState({
      dropdownAmount: !this.state.dropdownAmount,
    });
  }

  toggleType() {
    this.setState({
      dropdownType: !this.state.dropdownType,
    });
  }

  toggleTime() {
    this.setState({
      dropdownTime: !this.state.dropdownTime,
    });
  }

  render() {
    const { saleOfAllTime, creatorOfTheDay, saleOfTheDay, ActivityFeedList } =
      this.state;
    return (
      <div id="activityfeed">
        <Container fluid>
          <Row>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              <div className="item-box">
                <div className="top">
                  <p>Top Sale All Time</p>
                  <a href="#">
                    <i className="fa fa-arrow-right"></i>
                  </a>
                </div>
                <b>{saleOfAllTime?.amount + " " + saleOfAllTime?.coin}</b>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              <div className="item-box">
                <div className="top">
                  <p>Top Creator All Time </p>
                  <a href="#">
                    <i className="fa fa-arrow-right"></i>
                  </a>
                </div>
                <b>{this.state?.creatorOfAllTime?.from}</b>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              <div className="item-box">
                <div className="top">
                  <p>Top Sale of the Day </p>
                  <a href="#">
                    <i className="fa fa-arrow-right"></i>
                  </a>
                </div>
                <b>{saleOfTheDay.amount + " " + saleOfTheDay?.coin}</b>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              {" "}
              <div className="item-box">
                <div className="top">
                  <p>Creator of the Day</p>
                  <a href="#">
                    <i className="fa fa-arrow-right"></i>
                  </a>
                </div>
                <b>{creatorOfTheDay?.from}</b>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xl={12}>
              <ActivityGraph />
            </Col>
          </Row>
          <Row>
            <Col xl={12}>
              <h4>Activity Feed</h4>
            </Col>
            <Col xl={12}>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>
                        Amount
                        {/* <ButtonDropdown
                          isOpen={this.state.dropdownAmount}
                          toggle={this.toggleAmount}
                        >
                          <DropdownToggle caret>Amount</DropdownToggle>
                          <DropdownMenu>
                            <Button>{`< $100`}</Button>
                            <Button>$100-$1000</Button>
                            <Button>$1000-$5000</Button>
                            <Button>{`> $5000`}</Button>
                          </DropdownMenu>
                        </ButtonDropdown> */}
                      </th>
                      <th>
                        Type
                        {/* <ButtonDropdown
                          isOpen={this.state.dropdownType}
                          toggle={this.toggleType}
                        >
                          <DropdownToggle caret>Type</DropdownToggle>
                          <DropdownMenu>
                            <Button>Sale</Button>
                            <Button>Transfer</Button>
                            <Button>Listing</Button>
                          </DropdownMenu>
                        </ButtonDropdown> */}
                      </th>
                      <th>From</th>
                      <th>To</th>
                      <th>
                        Time
                        {/* <ButtonDropdown
                          isOpen={this.state.dropdownTime}
                          toggle={this.toggleTime}
                        >
                          <DropdownToggle caret>Time</DropdownToggle>
                          <DropdownMenu>
                            <Button>Last 1 day</Button>
                            <Button>Last 1 week</Button>
                            <Button>Last 1 month</Button>
                            <Button>All time</Button>
                          </DropdownMenu>
                        </ButtonDropdown> */}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ActivityFeedList.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="user-profile">
                            <img
                              src={item.itemImg}
                              height="100"
                              width="100"
                              alt="profile"
                            />
                            <a href="#">{item.itemName}</a>
                          </div>
                        </td>
                        <td>
                          <div className="amount">
                            <>{item.amount}</>
                            <span>{item.extra}</span>
                          </div>
                        </td>
                        <td>{item.type}</td>
                        <td>
                          <a href="#">{item.from}</a>
                        </td>
                        <td>
                          <a href="#">{item?.to ? item?.to : "-"}</a>
                        </td>
                        <td>{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
