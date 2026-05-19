import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Pressable,
    ScrollView,
} from "react-native";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

export default function App() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [loadingSinglePost, setLoadingSinglePost] = useState(false);
    const [loadingEditPost, setLoadingEditPost] = useState(false);
    const [loadingDeletePost, setLoadingDeletePost] = useState(false);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [singlePostError, setSinglePostError] = useState("");
    const [editPostError, setEditPostError] = useState("");
    const [deletePostError, setDeletePostError] = useState("");

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [userId, setUserId] = useState("");

    const [postIdToFetch, setPostIdToFetch] = useState("");
    const [selectedPost, setSelectedPost] = useState(null);

    const [createdPost, setCreatedPost] = useState(null);

    const [filterUserId, setFilterUserId] = useState("");

    const [editPostId, setEditPostId] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editBody, setEditBody] = useState("");
    const [editUserId, setEditUserId] = useState("");

    const [deletePostId, setDeletePostId] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError("Failed to fetch data from server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPostDetails = async () => {
        setSinglePostError("");
        setSelectedPost(null);

        if (!postIdToFetch.trim()) {
            setSinglePostError("Please enter a post ID.");
            return;
        }

        const postIdNumber = Number(postIdToFetch);

        if (Number.isNaN(postIdNumber)) {
            setSinglePostError("Post ID must be a number.");
            return;
        }

        try {
            setLoadingSinglePost(true);

            const response = await fetch(`${API_URL}/${postIdNumber}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (!data || Object.keys(data).length === 0) {
                setSinglePostError("No post found with the given ID.");
                return;
            }

            setSelectedPost(data);
        } catch (err) {
            setSinglePostError("Failed to fetch post details.");
            console.error(err);
        } finally {
            setLoadingSinglePost(false);
        }
    };

    const createPost = async () => {
        setFormError("");

        if (!title.trim() || !body.trim() || !userId.trim()) {
            setFormError("All fields are required.");
            return;
        }

        const userIdNumber = Number(userId);

        if (Number.isNaN(userIdNumber)) {
            setFormError("userId must be a number.");
            return;
        }

        try {
            setLoadingPost(true);
            setError("");

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    body: body.trim(),
                    userId: userIdNumber,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            setCreatedPost(data);

            Alert.alert("Success", "Post sent successfully.");

            setTitle("");
            setBody("");
            setUserId("");
        } catch (err) {
            setError("Failed to send data to server.");
            console.error(err);
        } finally {
            setLoadingPost(false);
        }
    };

    const updatePost = async () => {
        setEditPostError("");

        if (!editPostId.trim()) {
            setEditPostError("Please enter a post ID to edit.");
            return;
        }

        const postIdNumber = Number(editPostId);

        if (Number.isNaN(postIdNumber)) {
            setEditPostError("Post ID must be a number.");
            return;
        }

        const payload = {};

        if (editTitle.trim()) payload.title = editTitle.trim();
        if (editBody.trim()) payload.body = editBody.trim();
        if (editUserId.trim()) {
            const userIdNumber = Number(editUserId);
            if (Number.isNaN(userIdNumber)) {
                setEditPostError("userId must be a number.");
                return;
            }
            payload.userId = userIdNumber;
        }

        if (Object.keys(payload).length === 0) {
            setEditPostError("Enter at least one field to update.");
            return;
        }

        try {
            setLoadingEditPost(true);
            setError("");

            const response = await fetch(`${API_URL}/${postIdNumber}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const updatedPost = await response.json();

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postIdNumber
                        ? { ...post, ...updatedPost }
                        : post,
                ),
            );

            setSelectedPost((prev) =>
                prev && prev.id === postIdNumber
                    ? { ...prev, ...updatedPost }
                    : prev,
            );

            setCreatedPost((prev) =>
                prev && prev.id === postIdNumber
                    ? { ...prev, ...updatedPost }
                    : prev,
            );

            Alert.alert("Success", "Post updated successfully.");

            setEditPostId("");
            setEditTitle("");
            setEditBody("");
            setEditUserId("");
        } catch (err) {
            setEditPostError("Failed to update post.");
            console.error(err);
        } finally {
            setLoadingEditPost(false);
        }
    };

    const deletePost = async () => {
        setDeletePostError("");

        if (!deletePostId.trim()) {
            setDeletePostError("Please enter a post ID to delete.");
            return;
        }

        const postIdNumber = Number(deletePostId);

        if (Number.isNaN(postIdNumber)) {
            setDeletePostError("Post ID must be a number.");
            return;
        }

        try {
            setLoadingDeletePost(true);
            setError("");

            const response = await fetch(`${API_URL}/${postIdNumber}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            setPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== postIdNumber),
            );

            setSelectedPost((prev) =>
                prev && prev.id === postIdNumber ? null : prev,
            );

            setCreatedPost((prev) =>
                prev && prev.id === postIdNumber ? null : prev,
            );

            Alert.alert("Success", "Post deleted successfully.");

            setDeletePostId("");
        } catch (err) {
            setDeletePostError("Failed to delete post.");
            console.error(err);
        } finally {
            setLoadingDeletePost(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.postCard}>
            <Text style={styles.postId}>ID: {item.id}</Text>

            <Text style={styles.postTitle}>Title: {item.title}</Text>

            <Text style={styles.postBody}>Body: {item.body}</Text>
        </View>
    );

    const filteredPosts = filterUserId.trim()
        ? posts.filter((p) => String(p.userId) === filterUserId.trim())
        : posts;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <Text style={styles.header}>React Native REST API</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add New Post</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Body"
                    value={body}
                    onChangeText={setBody}
                    multiline
                />

                <TextInput
                    style={styles.input}
                    placeholder="User ID"
                    value={userId}
                    onChangeText={setUserId}
                    keyboardType="numeric"
                />

                {formError ? (
                    <Text style={styles.formError}>{formError}</Text>
                ) : null}

                <Pressable
                    style={styles.button}
                    onPress={createPost}
                    disabled={loadingPost}
                >
                    <Text style={styles.buttonText}>
                        {loadingPost ? "Sending..." : "Send"}
                    </Text>
                </Pressable>

                {createdPost && (
                    <View style={styles.successBox}>
                        <Text style={styles.successTitle}>
                            Server Response:
                        </Text>

                        <Text style={styles.successText}>
                            {JSON.stringify(createdPost, null, 2)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Get Single Post</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Post ID, e.g. 1"
                    value={postIdToFetch}
                    onChangeText={setPostIdToFetch}
                    keyboardType="numeric"
                />

                {singlePostError ? (
                    <Text style={styles.formError}>{singlePostError}</Text>
                ) : null}

                <Pressable
                    style={styles.button}
                    onPress={fetchPostDetails}
                    disabled={loadingSinglePost}
                >
                    <Text style={styles.buttonText}>
                        {loadingSinglePost ? "Loading..." : "Fetch Post"}
                    </Text>
                </Pressable>

                {selectedPost && (
                    <View style={styles.successBox}>
                        <Text style={styles.successTitle}>Post details:</Text>
                        <Text style={styles.successText}>
                            {JSON.stringify(selectedPost, null, 2)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Edit Post (PATCH)</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Post ID to edit"
                    value={editPostId}
                    onChangeText={setEditPostId}
                    keyboardType="numeric"
                />

                <TextInput
                    style={styles.input}
                    placeholder="New title (optional)"
                    value={editTitle}
                    onChangeText={setEditTitle}
                />

                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="New body (optional)"
                    value={editBody}
                    onChangeText={setEditBody}
                    multiline
                />

                <TextInput
                    style={styles.input}
                    placeholder="New user ID (optional)"
                    value={editUserId}
                    onChangeText={setEditUserId}
                    keyboardType="numeric"
                />

                {editPostError ? (
                    <Text style={styles.formError}>{editPostError}</Text>
                ) : null}

                <Pressable
                    style={styles.button}
                    onPress={updatePost}
                    disabled={loadingEditPost}
                >
                    <Text style={styles.buttonText}>
                        {loadingEditPost ? "Updating..." : "Update Post"}
                    </Text>
                </Pressable>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delete Post (DELETE)</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Post ID to delete"
                    value={deletePostId}
                    onChangeText={setDeletePostId}
                    keyboardType="numeric"
                />

                {deletePostError ? (
                    <Text style={styles.formError}>{deletePostError}</Text>
                ) : null}

                <Pressable
                    style={styles.button}
                    onPress={deletePost}
                    disabled={loadingDeletePost}
                >
                    <Text style={styles.buttonText}>
                        {loadingDeletePost ? "Deleting..." : "Delete Post"}
                    </Text>
                </Pressable>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Posts List</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Filter by userId"
                    value={filterUserId}
                    onChangeText={setFilterUserId}
                    keyboardType="numeric"
                />

                {loading ? (
                    <ActivityIndicator size="large" />
                ) : error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredPosts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        scrollEnabled={false}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f4f4",
    },

    content: {
        padding: 16,
        paddingBottom: 40,
    },

    header: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
    },

    section: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 3,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: "#fff",
    },

    multilineInput: {
        minHeight: 100,
        textAlignVertical: "top",
    },

    button: {
        backgroundColor: "#1976d2",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    formError: {
        color: "red",
        marginBottom: 10,
        fontWeight: "600",
    },

    errorBox: {
        backgroundColor: "#ffe5e5",
        padding: 12,
        borderRadius: 8,
    },

    errorText: {
        color: "#c62828",
        fontWeight: "600",
    },

    successBox: {
        marginTop: 14,
        backgroundColor: "#e8f5e9",
        padding: 12,
        borderRadius: 8,
    },

    successTitle: {
        fontWeight: "700",
        marginBottom: 6,
    },

    successText: {
        fontSize: 12,
        fontFamily: "monospace",
    },

    listContainer: {
        paddingBottom: 10,
    },

    postCard: {
        backgroundColor: "#fafafa",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },

    postId: {
        fontWeight: "700",
        marginBottom: 4,
    },

    postTitle: {
        fontWeight: "600",
        marginBottom: 6,
    },

    postBody: {
        color: "#444",
    },
});
