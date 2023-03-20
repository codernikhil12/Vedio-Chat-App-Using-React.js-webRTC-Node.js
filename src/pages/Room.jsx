import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../Providers/Socket";
import { usePeer } from "../Providers/peer";
import ReactPayer from "react-player";

const RoomPage = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState();

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("New User Joined", emailId);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("incomming call from", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("Call accepted");
      await setRemoteAns(ans);
    },
    [setRemoteAns]
  );
  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setMyStream(stream);
  }, []);

  const handleNegosiation = useCallback(() => {
    const localOffer = peer.localDescription;
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  }, [peer.localDescription, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("user-Joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncomingCall);
    socket.on("call-accpted", handleCallAccepted);

    // return () => {
    //   socket.off("user-joined", handleNewUserJoined);
    //   socket.off("incomming-call", handleIncomingCall);
    //   socket.off("call-accepted", handleCallAccepted);
    // };
  }, [handleIncomingCall, handleNewUserJoined, socket, handleCallAccepted]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegosiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegosiation);
    };
  });

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);
  return (
    <div className="room-page-container">
      <h2>Room page</h2>
      <h3>You are conected to {remoteEmailId}</h3>
      <button onClick={(e) => sendStream(myStream)}>Send my vedio</button>
      <ReactPayer url={myStream} playing muted />
      <ReactPayer url={remoteStream} playing muted />
    </div>
  );
};

export default RoomPage;
