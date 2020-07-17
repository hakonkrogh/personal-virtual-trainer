import React, { useState, useEffect } from "react";

export default function RandomGiphy() {
  const [image, setImage] = useState(null);

  async function getNew() {
    const res = await fetch(
      "//api.giphy.com/v1/gifs/random?api_key=eudob2QHdIwUbLceqBXcwqAJblxO9dEm&tag=workout%2C+fail"
    ).then((r) => r.json());
    console.log(res);
    setImage(res.data.image_url);
  }

  useEffect(() => {
    getNew();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={image}
        style={{ width: "100%", maxHeight: "400px" }}
        onClick={getNew}
      />
    </div>
  );
}
