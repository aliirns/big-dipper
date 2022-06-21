import {Meteor} from "meteor/meteor";
import {Actions} from "../actions.js";

Meteor.methods({

  //to like a specific nft, by a specific user
  "Actions.likeNFT": function (nftId, liker) {
    this.unblock();

    var action = {
      nftId: nftId,
      actionType: "Like",
      from: liker
    }

    /*
    upsert a like action, so that multiple likes 
    on same nft and from same user are disallowed
    */
    return Actions.upsert(action, {$set: action})
  },

  //to view a specific nft, by a specific user
  "Actions.viewNFT": function (nftId, viewer) {
    this.unblock();

    var action = {
      nftId: nftId,
      actionType: "View",
      from: viewer
    }

    /*
    upsert a view action, so that the insertion of multiple
    views on same nft and from same user is disallowed
    */
    return Actions.upsert(action, {$set: action})
  },

  //to unlike an nft, already liked by a specific user
  "Actions.unLikeNFT": function (nftId, unliker) {
    this.unblock();

    //check if the user has already liked the specified nft
    var action = Actions.findOne({
      nftId: nftId, 
      actionType: "Like", 
      from: unliker
    })

    //if not, inform the caller
    if (action == null){
      return "can't unlike"
    }

    //if yes, remove the like
    return Actions.remove({
      _id: action._id
    });

  },

  //to get likes and view on an NFT
  "Actions.getLikesAndViewsOnNFT": function (nftId) {
    this.unblock();

    //get likes on this nft
    var likes = Actions.find({
      nftId: nftId, 
      actionType: "Like"
    }).count()

    //get views on this nft
    var views = Actions.find({
      nftId: nftId,
      actionType: "View"
    }).count()

    //prepare stats
    var stats = {
      likes: likes,
      views: views
    }

    //return stats
    return stats
  },

  //to check if a certain user has liked a specific nft or not
  "Actions.isLiked": function (nftId, liker) {
    this.unblock();

    //check if the specified user has liked the specified nft
    var result =  Actions.findOne({
      nftId: nftId, 
      actionType: "Like", 
      from: liker
    })

    //if a like is found, return true
    if (result != null){
      return true
    }

    //else return false
    return false
  }

});
