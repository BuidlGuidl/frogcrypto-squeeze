import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { Address } from "~~/components/scaffold-eth";
import { TTokenInfo } from "~~/types/frog";

type UserData = {
  id: string;
  rarityAmount?: bigint;
  jumpAmount?: bigint;
  speedAmount?: bigint;
  intelligenceAmount?: bigint;
  beautyAmount?: bigint;
  totalAmount?: bigint;
};

type UsersData = { users: { items: UserData[] } };

export const Leaderboard = ({ token }: { token: TTokenInfo }) => {
  const fetchUsersData = async () => {
    const UsersDataQuery = gql`
        query Users {
          users(orderBy: "${token.attribute.toLowerCase()}Amount", orderDirection: "desc") {
            items {
              id
              ${token.attribute.toLowerCase()}Amount
            }
          }
        }
      `;
    const data = await request<UsersData>(
      process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069",
      UsersDataQuery,
    );
    return data;
  };

  const { data: leaderboard } = useQuery({
    queryKey: ["usersData", token.attribute],
    queryFn: fetchUsersData,
    refetchInterval: 60000,
  });

  return (
    <div className="py-10 px-6">
      <h2 className="text-3xl sm:text-4xl font-lindenHill tracking-wide">{token.name}</h2>
      {!leaderboard && (
        <div className="flex items-center flex-col flex-grow pt-12">
          <div className="loading loading-dots loading-md"></div>
        </div>
      )}
      {leaderboard && !leaderboard.users.items.length && (
        <div className="flex items-center flex-col flex-grow pt-4">
          <p className="text-center text-xl tracking-wide">No Users Found</p>
        </div>
      )}
      {leaderboard && leaderboard.users.items.length && (
        <div className="mt-3 overflow-x-auto bg-white border border-gray-300">
          <table className="table">
            <thead>
              <tr>
                <th>Address</th>
                <th className="text-right">Rewards</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.users.items.map((user: UserData) => (
                <tr key={user.id}>
                  <td>
                    <Address address={user.id} size="sm" />
                  </td>
                  <td className="text-right">{user[`${token.attribute.toLowerCase()}Amount` as keyof UserData]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
