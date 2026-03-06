async function testLive() {
    try {
        console.log("Fetching live posts...");
        const res = await fetch("https://tywaky-backend.onrender.com/api/posts");
        const posts = await res.json();
        if (posts.length === 0) return console.log("No posts");
        const testPost = posts[0];
        console.log("Got post:", testPost._id, "reactions before:", testPost.reactions);

        console.log("Reacting to live post...");
        const reactRes = await fetch("https://tywaky-backend.onrender.com/api/posts/" + testPost._id + "/react", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "65e236b2eb12abc123456789", reactionType: "like" }) // mock ID
        });

        const text = await reactRes.text();
        console.log("Live React API Response:", text);
    } catch (err) {
        console.error("Test Error:", err);
    }
}
testLive();
