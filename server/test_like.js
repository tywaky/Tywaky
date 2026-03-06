async function testReact() {
    try {
        console.log("Fetching posts...");
        const res = await fetch("http://localhost:5000/api/posts");
        const posts = await res.json();
        if (posts.length === 0) return console.log("No posts");
        const testPost = posts[0];
        console.log("Got post:", testPost._id, "reactions before:", testPost.reactions);

        console.log("Reacting to post...");
        const reactRes = await fetch("http://localhost:5000/api/posts/" + testPost._id + "/react", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "678aa9f8f4a132abcde12345", reactionType: "like" }) // mock ID
        });
        const result = await reactRes.json();
        console.log("React API Response:", result);
    } catch (err) {
        console.error("Test Error:", err);
    }
}
testReact();
