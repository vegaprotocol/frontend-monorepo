import { ApolloProvider } from "@apollo/client";
import React from "react";

import { client } from "../../lib/apollo-client";

export const GraphQlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
