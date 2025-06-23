'use client';
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GroupModal from "../common/Modal";
import { io } from "socket.io-client";
import { formatCustomDate } from "../utils/utils";
import Bell from "../common/Bell";
import Menu from "../common/Menu";
import Image from "next/image";

export default function ChatPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [usersResult, setUsersResult] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [notifications, setNotifications] = useState([]);
    const [newMessageRecieved, setNewMessageRecieved] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [total, setTotal] = useState(0);

    const messagesContainerRef = useRef(null);

    const messagesEndRef = useRef(null);
    const isLoadingOlderMessages = useRef(false);
    const pageRef = useRef(1);

    const setPageAndRef = (val) => {
        pageRef.current = val;
        setPage(val);
    };

    const scrollToBottom = () => {
        console.log("scrolling to bottom");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isLoadingOlderMessages.current) return; // skip auto-scroll
        scrollToBottom();
    }, [newMessageRecieved, typingUsers]);

    // useEffect(() => {
    //     console.log("chat", selectedChat, user);
    //     if (!selectedChat || !user) return;

    //     setPage(1); // 🔄 reset to first page
    //     setMessages([]); // clear previous chat messages
    //     loadMessages(); // fetch page 1
    //     scrollToBottom();
    // }, [selectedChat, user]);

    useEffect(() => {
        if (!selectedChat || !user) return;

        const fetchAndScroll = async () => {
            await loadMessages(); // wait for messages
            setNewMessageRecieved(true); // trigger scroll via useEffect
        };
        fetchAndScroll();
        setPageAndRef(1); // 🔄 reset to first page
        setMessages([]); // clear previous chat messages
    }, [selectedChat, user]);

    useEffect(() => {
        if (!selectedChat || !user) return;
        loadMessages();
    }, [page]);

    const ENDPOINT = "https://chat-backend-bgsn.onrender.com";
    const socket = useRef(null);
    const selectedChatRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        socket.current = io(ENDPOINT);
        socket.current.emit("setup", user);
        socket.current.on("connected", () => setSocketConnected(true));

        return () => socket.current.disconnect(); // Clean up
    }, [user]);

    useEffect(() => {
        if (!selectedChat || !socket.current) return;

        socket.current.emit("join chat", selectedChat._id);
        console.log("Joined chat", selectedChat._id);
        selectedChatRef.current = selectedChat; // ✅ correctly updated ref
    }, [selectedChat]);

    useEffect(() => {
        if (!socket.current) return;

        const handleMessage = (newMessageRecieved) => {
            console.log("📨 Message received via socket:", newMessageRecieved);

            if (
                !selectedChatRef.current ||
                selectedChatRef.current._id !== (newMessageRecieved.chat._id || newMessageRecieved.chat)
            ) {
                console.log("❌ Message not for this chat");
                if (!notifications.includes(newMessageRecieved)) setNotifications(prev => [newMessageRecieved, ...prev])
                return;
            }
            setMessages(prev => [...prev, newMessageRecieved]);
            setNewMessageRecieved(true)
        };

        socket.current.on("message recieved", handleMessage);
        console.log("📡 Listener registered");

        return () => {
            socket.current.off("message recieved", handleMessage);
            console.log("❌ Listener cleaned up");
        };
    }, [socketConnected, user]); // Can also use `user` if more reliable

    useEffect(() => {
        const onPopState = () => {
            // This runs when user presses mobile back button or browser back button
            setSelectedChat(null); // reset chat selection
        };

        window.addEventListener('popstate', onPopState);

        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    useEffect(() => {
        if (!socket.current) return;

        const handleTyping = (user) => {
            setTypingUsers((prev) => {
                const exists = prev.find((u) => u._id === user._id);
                if (!exists) return [...prev, user];
                return prev;
            });
        };

        const handleStopTyping = (userId) => {
            setTypingUsers((prev) => prev.filter((u) => u._id !== userId));
        };

        socket.current.on("typing", handleTyping);
        socket.current.on("stop typing", handleStopTyping);

        return () => {
            socket.current.off("typing", handleTyping);
            socket.current.off("stop typing", handleStopTyping);
        };
    }, [socketConnected]);



    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        console.log("Stored user", storedUser);
        if (!storedUser) {
            router.push("/");
            return;
        }
        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        } catch (err) {
            console.error("Failed to parse user from localStorage", err);
            localStorage.removeItem("user");
            router.push("/");
        }
    }, [router]);

    // ✅ Fetch chats after user is loaded
    useEffect(() => {
        if (!user) return;

        const fetchChats = async () => {
            try {
                const res = await fetch("https://chat-backend-bgsn.onrender.com/api/chat", {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                });
                const data = await res.json();
                console.log("Chat response:", data);
                setChats(data);
            } catch (err) {
                console.error("Error fetching chats", err);
            }
        };

        fetchChats();
    }, [user]);

    // ✅ Search users
    const handleSearch = async () => {
        if (!searchTerm.trim() || !user) return;
        try {
            const res = await fetch(
                `https://chat-backend-bgsn.onrender.com/api/user/searchUser?search=${searchTerm}`,
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );
            const data = await res.json();
            setUsersResult(data);
        } catch (err) {
            console.error("Search error", err);
        }
    };


    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (container.scrollTop === 0) {
            console.log("🔝 Reached the top of the chat", page);
            // setPage((prev) => prev + 1);
            if (messages.length < total) {
                setPageAndRef((prev) => prev + 1);
                isLoadingOlderMessages.current = true;
                const previousScrollHeight = container.scrollHeight;


                loadMessages(previousScrollHeight); // pass height to adjust later
            } else {
                setPageAndRef(1);
            }
        }
    };


    // ✅ Create new chat with selected user
    const selectSearchedUser = async (u) => {
        console.log("This runs")
        if (!user) return;
        try {
            const res = await fetch("https://chat-backend-bgsn.onrender.com/api/chat/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ userId: u._id }),
            });
            const chatData = await res.json();
            // setChats((prev) => [chatData, ...prev]);
            setChats((prev) => {
                const exists = prev.find((chat) => chat._id === chatData._id);
                if (exists) {
                    // Replace the existing chat with the updated one and keep order
                    return [chatData, ...prev.filter((chat) => chat._id !== chatData._id)];
                } else {
                    // New chat, add to top
                    return [chatData, ...prev];
                }
            });
            setSelectedChat(chatData);
            setUsersResult([]);
            setSearchTerm("");
        } catch (err) {
            console.error("Error creating chat", err);
        }
    };

    const loadMessages = async (previousScrollHeight = null) => {
        try {
            const res = await fetch(
                `https://chat-backend-bgsn.onrender.com/api/message/${selectedChat._id}?page=${page}&limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );
            let { msgs, totalCount } = await res.json();
            setTotal(totalCount);
            // ✅ Sort messages from oldest to newest (frontend fix)
            msgs.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateA - dateB;
            });

            // ✅ Prepend older messages
            setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m._id));
                const newMessages = msgs.filter((m) => !existingIds.has(m._id));
                return [...newMessages, ...prev];
            });

            setNewMessageRecieved(false);

            // ✅ Adjust scroll position after DOM update
            setTimeout(() => {
                if (isLoadingOlderMessages.current && previousScrollHeight !== null) {
                    const container = messagesContainerRef.current;
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop = newScrollHeight - previousScrollHeight;
                    }
                    isLoadingOlderMessages.current = false;
                }
            }, 0);
        } catch (err) {
            console.error("Error loading messages", err);
        }
    };



    // ✅ Load messages for selected chat
    useEffect(() => {
        if (!selectedChat || !user) return;
        loadMessages();
    }, [selectedChat, user]);

    // ✅ Send message
    const handleSend = async () => {
        if (!messageInput.trim() || !selectedChat || !user) return;
        try {
            const res = await fetch("https://chat-backend-bgsn.onrender.com/api/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    content: messageInput,
                    chatId: selectedChat._id,
                    senderId: user._id,
                }),
            });
            const newMsg = await res.json();
            socket.current.emit("new message", newMsg);
            setMessages([...messages, newMsg]);
            setMessageInput("");
        } catch (err) {
            console.error("Send error", err);
        }
    };

    const typingTimeoutRef = useRef(null);

    const handleType = (e) => {
        setMessageInput(e.target.value);

        if (!typing) {
            setTyping(true);
            socket.current.emit("typing", {
                roomId: selectedChat._id,
                user: { _id: user._id, name: user.name },
            });
        }

        // debounce stop typing
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.current.emit("stop typing", {
                roomId: selectedChat._id,
                user: { _id: user._id, name: user.name },
            });
            setTyping(false);
        }, 2000);
    };

    const toggleNotifications = () => {
        setShowNotifications(prev => {
            const next = !prev;
            // ❗ Clear only when *closing*, not opening
            if (!next) {
                setNotifications([]);
            }
            return next;
        });
    };

    if (!user) {
        return <div className="text-white text-center mt-20">Loading...</div>;
    }

    return (
        <div className="h-screen bg-[url('/aboutpagebackground.png')] md:p-4">
            <div className="bg-[rgba(0,0,0,0.1)] border-gray-600 border-solid border backdrop-blur-sm rounded-2xl md:p-5 ">
            {/* Top Bar */}
            {showGroupModal && (
                <GroupModal
                    user={user}
                    onClose={() => setShowGroupModal(false)}
                    onCreate={(newGroup) => {
                        setChats((prev) => [newGroup, ...prev]);
                        setSelectedChat(newGroup);
                    }}
                />
            )}
            <div className="md:mb-4 flex gap-3 md:gap-5 items-center md:p-0 p-4 font-sans">
                <div className="text-white bg-orange-300 p-2 rounded-full w-12 max-md:h-8 flex items-center justify-center">
                    {user?.name?.[0] || "U"}
                </div>
                <input
                    type="text"
                    className="w-full md:p-2 p-[3px] border rounded border-gray-600"
                    placeholder="Search users or conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    className="ml-2 px-4 bg-orange-400 text-white rounded leading-0 max-md:hidden md:h-[40px]"
                    onClick={handleSearch}
                >
                    Search
                </button>
                <button
                    className="bg-orange-400 w-[60px] text-white rounded md:hidden flex items-center justify-center h-8"
                    onClick={handleSearch}
                >
                    <Image src={"/search.svg"} width={20} height={20} alt="Search" />
                </button>
                <Bell count={notifications.length} click={toggleNotifications} />
                <div className="relative z-40 top-10">
                    {showNotifications &&
                        <Menu>
                            <div className="">
                                {!notifications.length ? (
                                    <div className="p-2">No notifications</div>
                                ) : notifications.map((n, i) => (
                                    <div key={n._id} className={`p-2 ${n.isSeen ? "bg-gray-100" : "bg-white"} ${notifications.length > 1 && i !== notifications.length - 1 && "border-b"}`}>
                                        <strong>{n.sender?.name || "Someone"}</strong>: {n.content}
                                        <div className="text-xs text-gray-400">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                                }
                            </div>
                        </Menu>}
                </div>
            </div>

            {/* Chat UI */}
            <div className="md:flex md:h-[79vh] h-[90vh] border border-gray-600 rounded overflow-hidden">
                {/* Sidebar */}
                <div className={`md:w-1/3 border-r border-gray-600 p-4 overflow-y-auto ${selectedChat && "max-md:hidden"}`}>
                    <div className="flex justify-between mb-5">
                        <h2 className="font-semibold mb-2 text-white">Conversations</h2>
                        <button onClick={() => setShowGroupModal(true)} className="bg-orange-400 text-white px-4 rounded">
                            New group
                        </button>
                    </div>

                    {/* Search Results */}
                    {usersResult.length > 0 ? (
                        usersResult.map((u) => (
                            <div
                                key={u._id}
                                className="p-2 mb-2 rounded cursor-pointer bg-yellow-200 hover:bg-yellow-300"
                                onClick={() => selectSearchedUser(u)}
                            >
                                {u.name} ({u.email})
                            </div>
                        ))
                    ) : chats.length === 0 ? (
                        <p className="text-white">No chats yet.</p>
                    ) : (
                        chats.filter((chat) => {
                            let name = "Unknown";

                            if (chat?.isGroupChat) {
                                name = chat?.chatName || "Unnamed Group";
                            } else if (Array.isArray(chat?.users)) {
                                const otherUser = chat.users.find((u) => u && u._id && u._id !== user?._id);
                                name = otherUser?.name || "Unknown";
                            }

                            return name.toLowerCase().includes(searchTerm.toLowerCase());
                        })
                            .map((chat) => {
                                const name = chat.isGroupChat
                                    ? chat.chatName
                                    : chat.users.find((u) => u._id !== user._id)?.name;
                                return (
                                    <div
                                        key={chat._id}
                                        className={`p-2 rounded cursor-pointer flex gap-4 items-center text-white mb-1 ${selectedChat?._id === chat._id
                                            ? "bg-[rgba(73,68,68,0.8)]"
                                            : "hover:bg-yellow-200 hover:text-black"
                                            }`}
                                        onClick={() => setSelectedChat(chat)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">{name.split("")[0]}</div>{name}
                                    </div>
                                );
                            })
                    )}
                </div>

                {/* Chat Window */}
                <div className={`md:w-2/3 h-full p-4 flex flex-col ${!selectedChat && "max-md:hidden"}`}>
                    {selectedChat ? (
                        <>
                            <h2 className="font-semibold text-lg mb-2 text-white">
                                Chatting with{" "}
                                {selectedChat.isGroupChat
                                    ? selectedChat.chatName
                                    : selectedChat?.users?.find((u) => u?._id && u._id !== user?._id)?.name || "Unknown"}
                            </h2>
                        {console.log(JSON.stringify(selectedChat), "CHAT")}
                            <div className="flex-1 rounded mb-2 p-2 overflow-y-auto" ref={messagesContainerRef} onScroll={handleScroll}>
                                {/* {console.log(messages)} */}
                                {messages.length > 0 && messages.map((m) => {
                                    return (
                                        <div key={m._id}>
                                            {m._id && <div
                                                className={`my-1 p-2 md:max-w-[70%] max-w-[85%] rounded-lg text-black flex justify-between ${m?.sender._id === user._id
                                                    ? "bg-blue-200 self-end ml-auto rounded-br-[0px]"
                                                    : "bg-gray-300 self-start mr-auto rounded-bl-[0px]"
                                                    }`}
                                            >
                                                <p className="text-wrap">{m.content}</p>
                                                {/* {selectedChat.isGroupChat ? <span className="text-xs text-gray-500">
                                                    {m.sender._id === user._id ? "You" : m.sender.name}<br />
                                                    {formatCustomDate(m.createdAt)}
                                                </span> : <span className="text-xs text-gray-500">
                                                    {formatCustomDate(m.createdAt)}
                                                </span>} */}
                                            </div>}
                                            <div className={`flex ${m?.sender._id === user._id?"justify-end":"justify-start"}`}>
                                            {selectedChat.isGroupChat ? <span className="text-xs text-gray-200">
                                                {m.sender._id === user._id ? "You" : m.sender.name}<br />
                                                {formatCustomDate(m.createdAt)}
                                            </span> : <span className="text-xs text-gray-200">
                                                {formatCustomDate(m.createdAt)}
                                            </span>}
                                            </div>
                                        </div>
                                    )
                                })}
                                {typingUsers.length > 0 && (
                                    <div className="text-sm text-gray-400 mb-2">
                                        {typingUsers.length === 1
                                            ? `${typingUsers[0].name} is typing...`
                                            : `${typingUsers.map(u => u.name).join(", ")} are typing...`}
                                    </div>
                                )}
                                {!messages.length && (
                                    <p className="text-sm text-gray-500">No messages yet.</p>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="flex mt-4">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border rounded-l bg-[rgba(255,255,255,0.8)] placeholder:text-red-400 text-gray-800"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => handleType(e)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button
                                    className="bg-orange-400 text-white px-4 rounded-r"
                                    onClick={handleSend}
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 m-auto">
                            Select a conversation to start chatting
                        </p>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}

