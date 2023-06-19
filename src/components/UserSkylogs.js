// UserSkylogs.js
import React, { useEffect, useState, useContext } from "react"; // 'useEffect'와 'useState'를 import
import { ScrollView, View, Text, StyleSheet, Image } from "react-native"; // 'Image'를 import
import { color } from "react-native-elements/dist/helpers";
import { fetchUserPosts } from "../database/FirebaseAuth"; // 'fetchUserPosts'를 import
import { UserContext } from "../database/UserContext"; // UserContext를 import
import { relativeTime, formatMonthDay } from "../utils/Functions";

const UserSkylogs = () => {
  const { user } = useContext(UserContext); // 현재 로그인한 사용자의 정보를 가져옵니다.
  const [posts, setPosts] = useState([]); // 사용자의 게시물을 저장할 상태를 추가합니다.

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        let userPosts = await fetchUserPosts(user.uid);
        // Add formatted creation date and relative time to each post
        userPosts = userPosts.map((post) => {
          const date = formatMonthDay(post.createdAt.toDate());
          const relativeDate = relativeTime(post.createdAt.toDate());
          return { ...post, date, relativeDate };
        });
        setPosts(userPosts);
      }
    };
    fetchPosts();
  }, [user]);

  return (
    <ScrollView horizontal={true} style={styles.container}>
      {posts.map((post, index) => (
        <View style={styles.item} key={index}>
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
          {/* <Text style={{ position: "absolute", color: "white" }}>{`Photo ${index + 1}`}</Text> */}
          <View style={styles.date}>
            <Text style={{ color: "white" }}>{post.date}</Text>
            <Text style={{ color: "white" }}>{post.relativeDate}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginBottom: 50,
    height: 120,
    backgroundColor: "#fff",
  },
  item: {
    width: 120,
    height: 120,
    marginRight: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%", // 이미지의 너비를 아이템의 너비와 같게 설정합니다.
    height: "100%", // 이미지의 높이를 아이템의 높이와 같게 설정합니다.
  },
  date: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserSkylogs;
