// Global.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  RefreshControl,
} from "react-native";
import { Avatar } from "react-native-elements";
// import { fetchAllPosts, getUserDetails, updateLike, getLikeCount } from "../database/FirebaseAuth";
import { fetchTopPosts, getUserDetails, updateLike, getLikeCount } from "../database/FirebaseAuth";
import { UserContext } from "../database/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import { formatDate, relativeTime } from "../utils/Functions";

const { width } = Dimensions.get("window");

const Global = () => {
  const { user } = useContext(UserContext);
  const [feed, setFeed] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nofeed, setNoFeed] = useState(false);
  const [likeCount, setLikeCount] = useState({});

  const fetchPosts = async () => {
    if (!user) {
      console.error("User is not defined");
      return;
    }

    // const posts = await fetchAllPosts(user.uid);
    // if (!Array.isArray(posts)) {
    //   // console.error("fetchAllPosts did not return an array:", posts);
    //   return;
    // }

    const posts = await fetchTopPosts(user.uid);
    if (!Array.isArray(posts)) {
      // console.error("fetchTopPosts did not return an array:", posts);
      return;
    }

    const postsWithUserDetails = await Promise.all(
      posts.map(async (post) => {
        const userDetails = await getUserDetails(post.userId);
        const { name, URI } = userDetails;
        const uploadDate = formatDate(post.createdAt.toDate());
        const relativeDate = relativeTime(post.createdAt.toDate());
        return { ...post, name, URI, uploadDate, relativeDate };
      })
    );

    if (postsWithUserDetails.length === 0) {
      setNoFeed(true);
    } else {
      setNoFeed(false);
    }

    setFeed(postsWithUserDetails);
  };

  const handleLikePress = async (postId) => {
    await updateLike(postId, user.uid);
    const likeCountForPost = await getLikeCount(postId);
    setLikeCount((prevLikeCount) => ({
      ...prevLikeCount,
      [postId]: likeCountForPost,
    }));
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Global!</Text>
      {nofeed && <Text>There is no skylog yet.</Text>}
      {feed.map((post) => (
        <View style={styles.feed} key={post.id}>
          <Text>{post.relativeDate}</Text>
          <Avatar size={70} rounded source={{ uri: post.URI }} containerStyle={{}} />
          <Text>{post.name}</Text>
          <Text>{post.uploadDate}</Text>
          <Text>{post.location}</Text>
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
          <View style={styles.caption}>
            <Text>{post.caption}</Text>
          </View>
          <TouchableOpacity style={styles.likes} onPress={() => handleLikePress(post.id)}>
            <Text>{`likes ${likeCount[post.id] || post.likes}`}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 150,
    alignItems: "center",
    //backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  feed: {
    width: width - 20,
    // height: width + 100,
    marginTop: 50,
    borderRadius: 20,
    paddingVertical: 20,
    backgroundColor: "#ffd5bf",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width - 50,
    height: width - 50,
  },
  caption: {
    backgroundColor: "white",
    top: 0,
    width: width - 50,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  likes: {
    backgroundColor: "hotpink",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
});

export default Global;
