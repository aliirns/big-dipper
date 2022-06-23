import React, { Component } from "react";
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

export default class ActivityFeed extends Component {
  constructor(props) {
    super(props);
    this.toggleAmount = this.toggleAmount.bind(this);
    this.toggleType = this.toggleType.bind(this);
    this.toggleTime = this.toggleTime.bind(this);
    this.state = {
      dropdownAmount: false,
      dropdownType: false,
      dropdownTime: false,
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

  ActivityFeedList = [
    {
      icon: "img/profile1.png",
      name: "Mona Lisa’s sister #0718",
      amount: "$5290.00",
      type: "Sale",
      from: "	User02718",
      to: "Sarahjohnson",
      time: "10s ago",
    },
    {
      icon: "img/profile2.png",
      name: "Mona Lisa’s sister #0718",
      amount: "$5290.00",
      extra: "$400.54",
      type: "Sale",
      from: "	User02718",
      to: "Sarahjohnson",
      time: "10s ago",
    },
    {
      icon: "img/profile3.png",
      name: "Mona Lisa’s sister #0718",
      amount: "$5290.00",
      extra: "$400.54",
      type: "Sale",
      from: "	User02718",
      to: "Sarahjohnson",
      time: "10s ago",
    },
    {
      icon: "img/profile1.png",
      name: "Mona Lisa’s sister #0718",
      amount: "$5290.00",
      type: "Sale",
      from: "	User02718",
      to: "Sarahjohnson",
      time: "10s ago",
    },
    {
      icon: "img/profile2.png",
      name: "Mona Lisa’s sister #0718",
      amount: "$5290.00",
      type: "Sale",
      from: "	User02718",
      to: "Sarahjohnson",
      time: "10s ago",
    },
    {
      icon: "img/profile3.png",
      name: "Mona Lisa’s sister #0718",
      amount: "$5290.00",
      type: "Sale",
      from: "	User02718",
      to: "Sarahjohnson",
      time: "10s ago",
    },
  ];

  render() {
    return (
      <div id="activityfeed">
        <Container fluid>
          <Row>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              <div className="item-box box1">
                <p>Top Sale of the Day</p>
                <b>$5,290</b>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              <div className="item-box box2">
                <p>Top Sale of All Time</p>
                <b>$133,000</b>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              <div className="item-box box3">
                <p>Top Earning of the Day</p>
                <b>$133,000</b>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6} sm={6} xs={12}>
              {" "}
              <div className="item-box box4">
                <p>Today’s Total Sales</p>
                <b>4</b>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xl={12}>
              <h1>Activity Feed</h1>
            </Col>
            <Col xl={12}>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>
                        <ButtonDropdown
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
                        </ButtonDropdown>
                      </th>
                      <th>
                        {" "}
                        <ButtonDropdown
                          isOpen={this.state.dropdownType}
                          toggle={this.toggleType}
                        >
                          <DropdownToggle caret>Type</DropdownToggle>
                          <DropdownMenu>
                            <Button>Sale</Button>
                            <Button>Transfer</Button>
                            <Button>Listing</Button>
                          </DropdownMenu>
                        </ButtonDropdown>
                      </th>
                      <th>From</th>
                      <th>To</th>
                      <th>
                        {" "}
                        <ButtonDropdown
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
                        </ButtonDropdown>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.ActivityFeedList.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="user-profile">
                            <img
                              src={item.icon}
                              height="100"
                              width="100"
                              alt="profile"
                            />
                            <a href="#">{item.name}</a>
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
                          <a href="#">{item.to}</a>
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
