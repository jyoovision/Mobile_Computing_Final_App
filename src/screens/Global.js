// Global.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  RefreshControl,
} from "react-native";
import { Avatar } from "react-native-elements";
import { fetchAllPosts, getUserDetails } from "../database/FirebaseAuth";
import { UserContext } from "../database/UserContext";
import { formatDate, relativeTime } from "../utils/Functions";

const { width } = Dimensions.get("window");

const Global = () => {
  const { user } = useContext(UserContext);
  const [feed, setFeed] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const posts = await fetchAllPosts(user.uid);
    if (!Array.isArray(posts)) {
      console.error("fetchFriendsPosts did not return an array:", posts);
      return;
    }

    const postsWithUserDetails = await Promise.all(
      posts.map(async (post) => {
        const userDetails = await getUserDetails(post.userId);
        const { name, URI } = userDetails; // 유저의 이름과 프로필 이미지를 가져옵니다.
        const uploadDate = formatDate(post.createdAt.toDate());
        const relativeDate = relativeTime(post.createdAt.toDate());
        return { ...post, name, URI, uploadDate, relativeDate };
      })
    );

    setFeed(postsWithUserDetails);
  };

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
      {feed.map((post) => (
        <View style={styles.feed} key={post.id}>
          <Text>{post.relativeDate}</Text>
          <Avatar size={60} rounded source={{ uri: post.URI }} containerStyle={{}} />
          <Text>{post.name}</Text>
          <Text>{post.uploadDate}</Text>
          <Text>{post.location}</Text>
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
          <Text>{post.caption}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingBottom: 150,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  feed: {
    width: width - 20,
    // height: width + 100,
    marginTop: 50,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ffd5bf",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width - 20,
    height: width - 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default Global;
