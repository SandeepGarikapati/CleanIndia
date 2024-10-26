"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Coins,
  Leaf,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { useMediaQuery } from "@/hook/useMediaQuerty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
  createUser,
  getUserBalance,
  getUserByEmail,
  getUnreadNotifications,
  markNotificationAsRead,
} from "../utils/db/actions";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "default-client-id";

interface UserInfo {
  email: string;
  name: string;
  [key: string]: unknown; // If there are additional properties you haven't defined yet
}


const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Sepolia Testnet",
  blockExplorer: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://assests.web3auth.io/evm-chains/sepolia.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3Auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  interface Notification {
    id: number;
    type: string;
    message: string; // Add this line to define the message property
  }

  const [notification, setNotification] = useState<Notification[]>([]);
  const [balance, setBalance] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const init = async () => {
      try {
        await web3Auth.initModal();
        setProvider(web3Auth.provider);
        if (web3Auth.connected) {
          setLoggedIn(true);
          const user = await web3Auth.getUserInfo();
          setUserInfo({
            ...user,
            email: user.email || "unknown@example.com",
            name: user.name || "Anonymous user",
          });

          if (user.email) {
            localStorage.setItem("email", user.email);
            try {
              await createUser(user.email, user.name || "Anonymous user");
            } catch (error) {
              console.log("Error in creating user", error);
            }
          }
        }
      } catch (error) {
        console.log("Error in initializing web3Auth", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadnotifications = await getUnreadNotifications(user.id);
          if (unreadnotifications) {
            setNotification(unreadnotifications);
          }
        }
      }
    };
    fetchNotifications();

    const notificationInterval = setInterval(fetchNotifications, 30);
    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userbalance = await getUserBalance(user.id);
          if (userbalance !== null) {
            setBalance(userbalance);
          }
        }
      }
    };
    fetchUserBalance();

    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener(
      "balanceUpdated",
      handleBalanceUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "balanceUpdated",
        handleBalanceUpdate as EventListener
      );
    };

    // const balanceInterval = setInterval(fetchUserBalance, 30000);
    // return () => clearInterval(balanceInterval);
  }, [userInfo]);

  const login = async () => {
    if (!web3Auth) {
      console.log("Web3Auth not initialized");
      return;
    }

    try {
      const web3authprovider = await web3Auth.connect();
      setProvider(web3authprovider);
      setLoggedIn(true);
      const user = await web3Auth.getUserInfo();
      setUserInfo({
        ...user,
        email: user.email || "unknown@example.com",
        name: user.name || "Anonymous user",
      });
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous user");
        } catch (error) {
          console.log("Error in creating user:", error);
        }
      }
    } catch (error) {
      console.log("Error in login:", error);
    }
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("Web3Auth not initialized");
      return;
    }

    try {
      await web3Auth.logout();
    } catch (error) {
      console.log("Error in logout:", error);
    }
  };

  const getUserInfo = async () => {
    if (web3Auth.connected) {
      const user = await web3Auth.getUserInfo();
      setUserInfo({
        ...user,
        email: user.email || "unknown@example.com",
        name: user.name || "Anonymous user",
      });
      console.log(totalEarnings);
      console.log(provider);
      if (user.email) {
        localStorage.setItem("email", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous user");
        } catch (error) {
          console.log("Error in creating user", error);
        }
      }
    }
  };

  const handleNotificationClick = async (notificationid: number) => {
    await markNotificationAsRead(notificationid);
  };

  if (loading) {
    return <div>Loading web3auth...</div>;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6 text-gray-800" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:w-8 md:h-8 text-green-500 mr-1 md:mr-2" />
            <span className="font-bold text-base md:text-lg text-gray-800">
              Nirmal-Bhumi
            </span>
          </Link>
        </div>
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-grey-400" />
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5 text-gray-800" />
                {notification.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                    {notification.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notification.length > 0 ? (
                notification.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.type}</span>
                      <span className="text-sm text-gray-500">
                        {notification.message}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>
                  <span className="text-gray-800">No new notifications</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1 ">
              <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500"/>
              <span className="font-semibold text-sm md:text-base text-gray-800">{balance.toFixed(2)}</span>
          </div>
          {!loggedIn ? (
            <Button onClick={login} className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">
               Login 
               <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5"/>
               </Button>
            ):(
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="items-center flex">
                    <User className="h-5 w-5 mr-1 text-gray-800"/>
                    <ChevronDown className="h-4 w-4 text-gray-800"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem onClick={getUserInfo}>
                      {userInfo ? userInfo.name: 'Profile'}
                   </DropdownMenuItem>
                   <DropdownMenuItem>
                     <Link href={'/settings'}> Settings </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                     Sign Out 
                    </DropdownMenuItem>
                </DropdownMenuContent>
               </DropdownMenu>
            )}
        </div>
      </div>
    </header>
  );
}
