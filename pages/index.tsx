import type { User } from "@prisma/client";
import type { NextPage } from "next";

import React, { FormEvent, useEffect, useState } from "react";
import { connect } from "socket.io-client";

const AuthForm: React.FC<{ setUserAuth: (user: User) => void }> = (props) => {
  const { setUserAuth } = props;
  const [formData, setFormData] = useState<{
    email: string;
  }>({
    email: "",
  });

  const changeFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.currentTarget;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.status === 404) return;

    const data = (await res.json()) as User;

    setUserAuth(data);
  };

  return (
    <form onSubmit={submit}>
      <input type="text" name="email" onChange={changeFormData} />
      <button type="submit">submit</button>
    </form>
  );
};

const SockTestForm: React.FC<{ user: User }> = (props) => {
  const { user } = props;
  const [sockConn, setSockConn] = useState(false);
  const [msgList, setMsgList] = useState<string[]>([]);
  const [privateMsgList, setPrivateMsgList] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [privateMsg, setPrivateMsg] = useState<{
    targetEmail: string;
    msg: string;
  }>({
    targetEmail: "",
    msg: "",
  });

  const changeMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    setMsg(value);
  };

  const changePrivateMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.currentTarget;

    setPrivateMsg({
      ...privateMsg,
      [name]: value,
    });
  };

  const sendMsg = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/public", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: user.email,
        message: msg,
      }),
    });

    console.log(res);

    if (res.status === 201) {
      setMsg("");
    }
  };

  const sendPrivateMsg = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/private", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: privateMsg.targetEmail,
        from: user.email,
        message: privateMsg.msg,
      }),
    });

    console.log(res);

    if (res.status === 201) {
      setMsg("");
    }
  };

  useEffect(() => {
    const initWS = async () => {
      const sock = connect("http://localhost:3000", {
        path: "/api/ws",
        auth: {
          token: user.id,
        },
      });

      if (sockConn) return;

      sock.on("connect", () => {
        setSockConn(true);
      });

      sock.on("message", (message: string) => {
        setMsgList((prev) => [...prev, message]);
      });

      sock.on(`${user.email}`, (message: string) => {
        setPrivateMsgList((prev) => [...prev, message]);
      });
    };

    initWS();
  }, [sockConn, user]);

  return (
    <div>
      <h1>user info</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>send public message</p>
      <form onSubmit={sendMsg}>
        <input type="text" onChange={changeMsg} />
        <button type="submit">send message</button>
      </form>
      <p>send private message</p>
      <form onSubmit={sendPrivateMsg}>
        <input type="text" name="targetEmail" onChange={changePrivateMsg} />
        <input type="text" name="msg" onChange={changePrivateMsg} />
        <button type="submit">send private message</button>
      </form>
      <p>public list</p>
      <ul>
        {msgList.length > 0 &&
          msgList.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p>private list</p>
      <ul>
        {privateMsgList.length > 0 &&
          privateMsgList.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
};

const Home: NextPage = () => {
  const [userConn, setUserConn] = useState<{
    conn: boolean;
    user: User;
  }>({
    conn: false,
    user: {
      email: "",
      id: 0,
      name: "",
    },
  });

  const setUserAuth = (user: User) => {
    setUserConn({
      ...userConn,
      user,
      conn: true,
    });
  };

  return (
    <div>
      {userConn.conn ? (
        <SockTestForm user={userConn.user} />
      ) : (
        <AuthForm setUserAuth={setUserAuth} />
      )}
    </div>
  );
};

export default Home;
