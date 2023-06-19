// Friends.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Avatar } from "react-native-elements";
import { fetchAllUsers, fetchUserByName } from "../database/FirebaseAuth";
import {
  sendFriendRequest,
  fetchFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  fetchFriends,
} from "../database/FirebaseAuth";

import { UserContext } from "../database/UserContext";

const { width, height } = Dimensions.get("window");

const Friends = () => {
  const { user } = useContext(UserContext);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [requestSent, setRequestSent] = useState({});

  const handleSearch = async () => {
    const users = await fetchUserByName(searchText);
    setSearchResult(users);
  };

  useEffect(() => {
    const fetchData = async () => {
      const friendRequests = await fetchFriendRequests(user.uid); // 친구 요청을 가져옵니다.
      const friends = await fetchFriends(user.uid); // 실제 친구 목록을 가져옵니다.

      setFriendRequests(friendRequests);
      setFriendsList(friends);
    };

    fetchData();
  }, [user.uid]);

  // 친구 요청 보내기
  const sendRequest = async (requesteeId) => {
    try {
      const currentUserId = user.uid;
      await sendFriendRequest(currentUserId, requesteeId);
      alert("Friend request sent!");

      setRequestSent({ ...requestSent, [requesteeId]: true }); // Add this line
    } catch (error) {
      alert("Error sending friend request");
    }
  };

  // 친구 요청을 수락하는 함수
  const acceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      alert("Friend request accepted!");

      // Refresh friend requests
      const friendRequests = await fetchFriendRequests(user.uid);
      setFriendRequests(friendRequests);
    } catch (error) {
      alert("Error accepting friend request");
    }
  };

  // 친구 요청을 거절하는 함수
  const rejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      alert("Friend request rejected!");

      // Refresh friend requests
      const friendRequests = await fetchFriendRequests(user.uid);
      setFriendRequests(friendRequests);
    } catch (error) {
      alert("Error rejecting friend request");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search friends..."
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text>Search</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.List}>
        {searchResult.length > 0 && (
          <>
            <Text>Search Results ({searchResult.length})</Text>
            {searchResult.map((user, index) => (
              <View style={styles.result} key={index}>
                <Avatar
                  size={60}
                  rounded
                  source={{
                    uri: user.URI,
                  }}
                  containerStyle={{ marginLeft: 10, marginRight: 10 }}
                />
                <Text>{user.name}</Text>
                {!requestSent[user.uid] ? (
                  <TouchableOpacity style={styles.Add} onPress={() => sendRequest(user.uid)}>
                    <Text>Add</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.Add}>Sent</Text>
                )}
              </View>
            ))}
          </>
        )}
        {friendRequests.length > 0 && (
          <>
            <Text>Friend Requests ({friendRequests.length})</Text>
            {friendRequests.map((request, index) => (
              <View style={styles.request} key={index}>
                <Avatar
                  size={60}
                  rounded
                  source={{
                    uri: request.requester.URI,
                  }}
                  containerStyle={{ marginLeft: 10, marginRight: 10 }}
                />
                <Text>{request.requester.name}</Text>
                {/* <Text>{request.requester.name} wants to be your friend!</Text> */}
                <View style={styles.acc_rej}>
                  <TouchableOpacity style={styles.Accept} onPress={() => acceptRequest(request.id)}>
                    <Text>Accept</Text>
                  </TouchableOpacity>
                  <Text>|</Text>
                  <TouchableOpacity style={styles.Reject} onPress={() => rejectRequest(request.id)}>
                    <Text>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <Text>Friends ({friendsList.length})</Text>
        {friendsList.map((friend) => (
          <View style={styles.friend} key={friend.uid}>
            <Avatar
              size={60}
              rounded
              source={{
                uri: friend.URI,
              }}
              containerStyle={{ marginLeft: 10, marginRight: 10 }}
            />
            <View>
              <Text>{friend.name}</Text>
              <Text>{friend.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    margin: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  List: {
    flex: 1,
    alignItems: "center",
    width: width - 40,
  },
  Add: {
    position: "absolute",
    right: 20,
  },
  acc_rej: {
    position: "absolute",
    right: 20,
    flexDirection: "row", // 아이템들을 가로로 나열
    justifyContent: "space-between", // 아이템 사이에 동일한 간격
    alignItems: "center",
    width: 100,
  },
  Accept: {},
  Reject: {},
  result: {
    flexDirection: "row",
    width: width - 40,
    height: 80,
    // justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "lightgray",
    borderRadius: 40,
  },
  request: {
    flexDirection: "row",
    width: width - 40,
    height: 80,
    // justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "darkgray",
    borderRadius: 40,
  },
  friend: {
    flexDirection: "row",
    width: width - 40,
    height: 80,
    // justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "gray",
    borderRadius: 40,
  },
});

export default Friends;
