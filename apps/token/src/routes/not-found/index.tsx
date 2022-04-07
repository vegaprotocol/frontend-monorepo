import { useTranslation } from "react-i18next";

import { Heading } from "../../components/heading";
import { useDocumentTitle } from "../../hooks/use-document-title";
import { RouteChildProps } from "..";

const NotFound = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  return (
    <>
      <Heading title={t("pageTitle404")} />
      <p>
        {t("This page can not be found, please check the URL and try again.")}
      </p>
    </>
  );
};

export default NotFound;
