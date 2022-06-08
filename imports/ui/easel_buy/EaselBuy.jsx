import React, { Component } from "react";
import { Spinner, Row, Col, Container } from "reactstrap";
import axios from "axios";
import i18n from "meteor/universe:i18n";
import settings from "../../../settings.json";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import _ from "lodash";
import {
  FlowRouterMeta,
  FlowRouterTitle,
} from "meteor/ostrio:flow-router-meta";

FlowRouter.route("/", {
  action() {
    /* ... */
  },
  title: "Big Dipper",
  /* ... */
});

new FlowRouterMeta(FlowRouter);
new FlowRouterTitle(FlowRouter);

const T = i18n.createComponent();

export default class EaselBuy extends Component {
  constructor(props) {
    super(props);
    console.log("[EasyBuy]: props in constructor", this.props);
    this.state = {
      name: this.props.name,
      description: this.props.description,
      price: this.props.price,
      img: this.props.img,
      createdAt: this.props.createdAt,
      royalty: this.props.royalty,
      id: this.props.id,
      history: this.props.history,
      nftHistory: [],
      loading: false,
      imageLoading: false,
      showHideComp1: false,
      showHideComp2: false,
      showHideComp3: false,
      showHideComp4: false,
    };
    this.hideComponent = this.hideComponent.bind(this);
  }

  hideComponent(name) {
    switch (name) {
      case "showHideComp1":
        this.setState({
          showHideComp1: !this.state.showHideComp1,
          showHideComp2: false,
          showHideComp3: false,
        });
        break;
      case "showHideComp2":
        this.setState({
          showHideComp2: !this.state.showHideComp2,
          showHideComp1: false,
          showHideComp3: false,
        });
        break;
      case "showHideComp3":
        this.setState({
          showHideComp3: !this.state.showHideComp3,
          showHideComp1: false,
          showHideComp2: false,
        });
        break;
      case "showHideComp4":
        this.setState({
          showHideComp4: !this.state.showHideComp4,
        });
        break;
      default:
        null;
    }
  }

  componentDidMount() {
    this.handleFetchData();
    this.handleFetchhistory();
  }
  handleFetchhistory = () => {
    console.log("this.state.history", this.state.history);
    console.log("fetch history");
    const url = settings.remote.api;
    axios
      .get(
        // `http://35.188.86.73:2317/Pylons-tech/pylons/pylons/get_recipe_history/${this.props.cookbook_id}/${this.props.recipe_id}`
        "http://35.188.86.73:2317/Pylons-tech/pylons/pylons/get_recipe_history/cookbookLOUD/recipe_1"
      )
      .then((res) => {
        console.log("res.data.History", res.data.History);
        this.setState({
          nftHistory: res.data.History,
        });
      });
  };
  handleFetchData = () => {
    const url = settings.remote.api;
    this.setState({ loading: true });
    axios
      .get(
        `${url}/pylons/recipe/${this.props.cookbook_id}/${this.props.recipe_id}`
      )
      .then((response) => {
        console.log("res is");
        const res = _.cloneDeep(response);
        const secondCopy = _.cloneDeep(response);
        let coin;
        this.setState({ loading: false });
        const selectedRecipe = res.data.Recipe;
        const coinInputs = selectedRecipe.coinInputs;
        let price;
        if (coinInputs.length > 0) {
          if (coinInputs[0].coins[0].denom == "USD") {
            price =
              Math.floor(coinInputs[0].coins[0].amount / 100) +
              "." +
              (coinInputs[0].coins[0].amount % 100) +
              " " +
              coinInputs[0].coins[0].denom;
          } else {
            let coins = Meteor.settings.public.coins;
            coin = coins.length
              ? coins.find(
                  (coin) =>
                    coin.denom.toLowerCase() ===
                    coinInputs[0].coins[0].denom.toLowerCase()
                )
              : null;
            if (coin) {
              price =
                coinInputs[0].coins[0].amount / coin.fraction +
                " " +
                coin.displayName;
            } else {
              price =
                coinInputs[0].coins[0].amount +
                " " +
                coinInputs[0].coins[0].denom;
            }
          }
        }
        console.log("coin", coin);
        const entries = selectedRecipe.entries;

        let img;
        if (entries != null) {
          const itemoutputs = entries.itemOutputs;
          if (itemoutputs.length > 0) {
            let strings = itemoutputs[0].strings;
            for (let i = 0; i < strings.length; i++) {
              try {
                if (
                  (strings[i].key =
                    "NFT_URL" && strings[i].value.indexOf("http") >= 0)
                ) {
                  img = strings[i].value;
                  break;
                }
              } catch (e) {
                console.log("strings[i].value", e);
                break;
              }
            }
          }
        }
        const strings = [
          ...secondCopy.data.Recipe.entries.itemOutputs[0].strings,
        ];
        const nftType = strings.find(
          (val) => val.key.toLowerCase() === "nft_format"
        ).value;
        console.log("strings are", nftType);
        const dimWidth = entries.itemOutputs[0].longs[1].weightRanges[0].lower;
        const dimHeight = entries.itemOutputs[0].longs[2].weightRanges[0].lower;
        const dimentions = this.getNFTDimentions(
          nftType,
          secondCopy.data.Recipe.entries.itemOutputs[0]
        );
        //   entries.itemOutputs[0].longs[1].weightRanges[0].lower +
        //   " x " +
        //   entries.itemOutputs[0].longs[2].weightRanges[0].lower;
        console.log("dimentions", !!img);
        this.setState({
          name: selectedRecipe.name,
          description: selectedRecipe.description,
          price,
          dimWidth,
          dimHeight,
          nftType,
          dimentions,
          displayName: coin.displayName,
          createdAt: moment(selectedRecipe.createdAt).format("DD/MM/YYYY"),
          royalty: entries.itemOutputs[0].tradePercentage * coin.fraction,
          edition: `${entries.itemOutputs[0].amountMinted} of ${entries.itemOutputs[0].quantity}`,
          img,
          id: selectedRecipe.ID,
          imageLoading: !!img ? false : true,
        });
      })
      .catch((err) => {
        this.setState({ loading: false });
        console.log(err);
      });
  };
  getNFTDimentions = (nftType, data) => {
    console.log("data", data);
    if (
      nftType.toLowerCase() === "image" ||
      nftType.toLowerCase() === "video"
    ) {
      return (
        data.longs[1].weightRanges[0].lower +
        " x " +
        data.longs[2].weightRanges[0].lower
      );
    } else if (nftType.toLowerCase() === "audio") {
      const millisecondsDuration = data.longs[3].weightRanges[0].lower;
      var minutes = Math.floor(millisecondsDuration / 60000);
      var seconds = ((millisecondsDuration % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds + " min";
    } else if (nftType.toLowerCase() === "3d") {
      return data.strings.find((val) => val.key.toLowerCase() === "size").value;
    } else {
    }
  };
  // In case IOS will redirect to APP Store if app not installed
  // In case Android will redirect to Play store if app not installed
  // In case in Browser will redirect to Play store
  handleLoginConfirmed = () => {
    const { apn, ibi, isi, oflIOS, oflPlay } =
      Meteor.settings.public.dynamicLink;
    const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    let ofl = oflPlay;
    if (isMacLike) {
      ofl = oflIOS;
    }

    ofl = encodeURIComponent(ofl);
    const baseURL = `https://pylons.page.link/?amv=1&apn=${apn}&ibi=${ibi}&imv=1&efr=1&isi=${isi}&`;
    window.location = `${baseURL}ofl=${ofl}&link=${encodeURIComponent(
      window.location.href
    )}`;
  };

  render() {
    const {
      showHideComp1,
      showHideComp2,
      showHideComp3,
      nftType,
      imageLoading,
      img,
      displayName,
      nftHistory,
    } = this.state;
    console.log("nftHistory");
    const getMedia = () => {
      console.log("imageLoading", nftType, img);

      if (imageLoading || !nftType)
        return <Spinner type="grow" color="primary" />;
      else if (nftType.toLowerCase() === "image")
        return (
          <img
            alt="views"
            src={img}
            style={{ width: "100%", height: "100%" }}
          />
        );
      else if (nftType.toLowerCase() === "audio")
        return (
          <audio controls>
            <source src={this.state.img} type="video/mp4" />
            <source src={this.state.img} type="video/ogg" />
            Your browser does not support the audio element.
          </audio>
        );
      else if (nftType.toLowerCase() === "3d")
        return (
          <model-viewer
            alt="3D NFT"
            src={this.state.img}
            ar
            ar-modes="webxr scene-viewer quick-look"
            environment-image="shared-assets/environments/moon_1k.hdr"
            poster="shared-assets/models/NeilArmstrong.webp"
            seamless-poster
            shadow-intensity="1"
            camera-controls
            enable-pan
          ></model-viewer>
        );
      else
        return (
          <video width="100%" height="100%" controls>
            <source src={this.state.img} type="video/mp4" />
            <source src={this.state.img} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        );
    };

    if (this.state.loading) {
      return <Spinner type="grow" color="primary" />;
    } else {
      return (
        <div className="buy-page">
          <div id="home">
            <Container>
              <Row>
                <Col xl={5} lg={5} md={12} sm={12}>
                  <div className="mob-img">
                    <img
                      alt="frame"
                      src="/img/frame.png"
                      width="445px"
                      height="989px"
                      className="mob-frame"
                    />
                    {getMedia()}
                  </div>
                </Col>
                <Col xl={7} lg={7} md={12} sm={12}>
                  <div className="details">
                    <div className="title-publisher">
                      <h4>{this.state.name}</h4>
                      <div className="publisher">
                        <p>
                          Created by{" "}
                          <span>
                            {!!(nftHistory && nftHistory.length)
                              ? nftHistory[0].senderName
                              : ""}
                          </span>
                          <img
                            alt="Published"
                            src="/img/check.svg"
                            style={{ width: "16px", height: "16px" }}
                          />
                        </p>
                      </div>
                      <div className="views">
                        {" "}
                        <img
                          alt="views"
                          src="/img/eye.svg"
                          style={{ width: "34px", height: "20px" }}
                        />
                        <p>0 views</p>
                      </div>
                    </div>
                    <div className="description">
                      <p>{this.state.description}</p>
                      <a onClick={() => this.hideComponent("showHideComp4")}>
                        read more
                      </a>
                      {/* {showHideComp4 ? (
                        <img
                          alt="minimize"
                          src="/img/minimize.svg"
                          style={{width: "27px", height: "27px"}}
                        />
                      ) : (
                        <img
                          alt="expand"
                          src="/img/expand.svg"
                          style={{width: "27px", height: "27px"}}
                        />
                      )} */}
                    </div>
                    <div className="more-details">
                      <div className="left-side">
                        <ul>
                          <li>
                            <div className="tab-name">
                              <p>Ownership</p>
                              <img
                                alt="Ownership"
                                src="/img/trophy.svg"
                                style={{ width: "40px", height: "40px" }}
                              />
                              <img
                                alt="line"
                                src="/img/line.svg"
                                style={{ width: "100%", height: "24px" }}
                                className="line"
                              />
                            </div>
                            <button
                              onClick={() =>
                                this.hideComponent("showHideComp1")
                              }
                            >
                              {showHideComp1 ? (
                                <img
                                  alt="minimize"
                                  src="/img/minimize.svg"
                                  style={{ width: "27px", height: "27px" }}
                                />
                              ) : (
                                <img
                                  alt="expand"
                                  src="/img/expand.svg"
                                  style={{ width: "27px", height: "27px" }}
                                />
                              )}
                            </button>
                            {showHideComp1 ? (
                              <div className="tab-panel">
                                <div className="item">
                                  <p>Owned by</p>
                                  <p>
                                    {!!(nftHistory && nftHistory.length)
                                      ? nftHistory[nftHistory.length - 1]
                                          .senderName
                                      : ""}
                                  </p>
                                </div>
                                <div className="item">
                                  <p>Edition</p>
                                  <p>{this.state.edition}</p>
                                </div>
                                <div className="item">
                                  <p>Royalty</p>
                                  <p>{this.state.royalty}</p>
                                </div>
                                <div className="item">
                                  <p>Size</p>
                                  <p>{this.state.dimentions}</p>
                                </div>
                                <div className="item">
                                  <p>Creation Date</p>
                                  <p>
                                    {!!(nftHistory && nftHistory.length)
                                      ? moment(
                                          nftHistory[nftHistory.length - 1]
                                            .createdAt
                                        ).format("DD/MM/YYYY hh:mm:ss")
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </li>
                          <li>
                            <div className="tab-name">
                              <p>NFT Detail</p>
                              <img
                                alt="NFT Detail"
                                src="/img/detail.svg"
                                style={{ width: "40px", height: "40px" }}
                              />
                              <img
                                alt="line"
                                src="/img/line.svg"
                                style={{ width: "100%", height: "24px" }}
                                className="line"
                              />
                            </div>
                            <button
                              onClick={() =>
                                this.hideComponent("showHideComp2")
                              }
                            >
                              {showHideComp2 ? (
                                <img
                                  alt="minimize"
                                  src="/img/minimize.svg"
                                  style={{ width: "27px", height: "27px" }}
                                />
                              ) : (
                                <img
                                  alt="expand"
                                  src="/img/expand.svg"
                                  style={{ width: "27px", height: "27px" }}
                                />
                              )}
                            </button>
                            {showHideComp2 ? (
                              <div className="tab-panel">
                                <div className="item">
                                  <p>Recipe ID</p>
                                  <p>
                                    <a href="#">{this.state.id}</a>
                                  </p>
                                </div>
                                <div className="item">
                                  <p>Blockchain</p>
                                  <p>Pylons</p>
                                </div>
                                <div className="item">
                                  <p>Permission</p>
                                  <p>Exclusive</p>
                                </div>
                              </div>
                            ) : null}
                          </li>
                          <li>
                            <div className="tab-name">
                              <p>History</p>
                              <img
                                alt="History"
                                src="/img/history.svg"
                                style={{ width: "40px", height: "40px" }}
                              />
                              <img
                                alt="line"
                                src="/img/line.svg"
                                style={{ width: "100%", height: "24px" }}
                                className="line"
                              />
                            </div>
                            <button
                              onClick={() =>
                                this.hideComponent("showHideComp3")
                              }
                            >
                              {showHideComp3 ? (
                                <img
                                  alt="minimize"
                                  src="/img/minimize.svg"
                                  style={{ width: "27px", height: "27px" }}
                                />
                              ) : (
                                <img
                                  alt="expand"
                                  src="/img/expand.svg"
                                  style={{ width: "27px", height: "27px" }}
                                />
                              )}
                            </button>
                            {showHideComp3 ? (
                              <div className="tab-panel">
                                {nftHistory &&
                                  nftHistory.map((val, i) => (
                                    <div className="item" key={i}>
                                      <p>
                                        {moment(val.createdAt).format(
                                          "DD/MM/YYYY hh:mm:ss"
                                        )}
                                      </p>
                                      <p>{val.senderName}</p>
                                    </div>
                                  ))}
                              </div>
                            ) : null}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="buy-btn">
                      <button onClick={this.handleLoginConfirmed}>
                        <img
                          alt="bg"
                          src="/img/btnbg.svg"
                          style={{ width: "100%", height: "100%" }}
                          className="btnbg"
                        />
                        <span className="dot"></span>
                        <div className="value-icon">
                          <div className="values">
                            <p>Buy for {this.state.price}</p>
                          </div>
                          <div className="icon">
                            <img
                              alt="coin"
                              src="/img/btc.svg"
                              style={{ width: "30px", height: "29px" }}
                            />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
            {/* <Col style={{ marginTop: "20rem" }}>
              <Col> */}
            {/* <Row style={{ margin: "auto", justifyContent: "center" }}>
                  {this.state.imageLoading && (
                    <Spinner type="grow" color="primary" />
                  )}
                  <div
                    style={{
                      display: this.state.imageLoading ? "none" : "contents",
                    }}
                  >
                    <img
                      alt="Easel on Google Play"
                      src={
                        this.state.img === ""
                          ? "/img/buy_icon.png"
                          : this.state.img
                      }
                      onLoad={() =>
                        this.setState({ ...this.state, imageLoading: false })
                      }
                      style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                        maxHeight: "25%",
                        minWidth: "80%",
                      }}
                    />
                  </div>
                </Row> */}
            {/* <Col
                  style={{
                    alignSelf: "center",
                    marginTop: "20px",
                    width: "100%",
                  }}
                > */}
            {/* <Row style={{ justifyContent: "center" }}>
                    <a style={{ fontSize: "1.5em" }}>
                      <b>{this.state.name}</b>
                    </a>
                  </Row> */}
            {/* <Row style={{ justifyContent: "center" }}>
                    <a style={{ wordBreak: "break-all" }}>
                      {this.state.description}
                    </a>
                  </Row> */}
            {/* <Row style={{ justifyContent: "center" }}>
                    <p style={{ marginTop: "7px", fontWeight: "500" }}>
                      {this.state.price}
                    </p>
                  </Row>
                </Col>
              </Col> */}
            {/* <Row style={{ marginTop: "10px" }}>
                <a
                  className="btn btn-primary"
                  onClick={this.handleLoginConfirmed}
                  style={{ margin: "auto", width: "120px" }}
                >
                  <i className="fas" />
                  {"    BUY    "}
                </a>
              </Row> */}
            {/* <Row style={{ margin: "auto", marginTop: "25px" }}>
                <Row
                  style={{
                    margin: "auto",
                    alignSelf: "center",
                    marginRight: "20px",
                  }}
                >
                  <img
                    alt="Easel on Google Play"
                    src="/img/easel.png"
                    style={{ width: "60px", height: "70px" }}
                  />
                </Row>
                <Row
                  style={{
                    margin: "auto",
                    alignSelf: "center",
                    marginLeft: "15px",
                  }}
                >
                  <img
                    alt="Easel on Google Play"
                    src="/img/wallet.png"
                    style={{ width: "60px", height: "70px" }}
                  />
                </Row> */}
            {/* </Row> */}
            {/* </Col> */}
          </div>
        </div>
      );
    }
  }
}
