import React, { useState, useEffect } from "react";

export default function RandomGiphy({ tag = "workout,fail" }) {
  const [image, setImage] = useState(null);

  async function getNew() {
    setImage(null);

    const res = await fetch(
      "//api.giphy.com/v1/gifs/random?api_key=eudob2QHdIwUbLceqBXcwqAJblxO9dEm&tag=" +
        encodeURIComponent(tag)
    ).then((r) => r.json());

    setImage(res.data.image_url);
  }

  useEffect(() => {
    getNew();
  }, []);

  return (
    <div style={{ textAlign: "center", cursor: "pointer" }}>
      <img
        src={image}
        style={{
          width: "100%",
          maxHeight: "400px",
          opacity: image ? 1 : 0.5,
          objectFit: "contain",
        }}
        onClick={getNew}
      />
      <div style={{ color: "#aaa", fontSize: ".3em", marginTop: 5 }}>
        <i>Klikk for nytt bilde</i>
      </div>
    </div>
  );
}
