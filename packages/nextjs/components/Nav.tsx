"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  BeakerIcon,
  CodeBracketSquareIcon,
  HomeIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export function Nav() {
  const pathname = usePathname();

  const isFixed = pathname === "/newsfeed" || pathname === "/usersLeaderboard";
  return (
    <div className={clsx(isFixed ? "py-12" : "py-6")}>
      <div
        className={clsx("flex justify-center w-full", {
          "py-6 fixed bottom-0 left-0 right-0": isFixed,
        })}
      >
        <ul className="menu menu-horizontal bg-lime-800 text-gray-50 rounded-md">
          <li>
            <Link href="/">
              <HomeIcon className="w-6 h-6" />
            </Link>
          </li>
          <li>
            <Link href="/rewards">
              <BeakerIcon className="w-6 h-6" />
            </Link>
          </li>
          <li>
            <Link href="/newsfeed">
              <UserGroupIcon className="w-6 h-6" />
            </Link>
          </li>
          <li>
            <Link href="/usersLeaderboard">
              <PresentationChartBarIcon className="w-6 h-6" />
            </Link>
          </li>
          <li>
            <Link href="https://github.com/BuidlGuidl/frogcrypto-squeeze" target="_blank">
              <CodeBracketSquareIcon className="w-6 h-6" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
