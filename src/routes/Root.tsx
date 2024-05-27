import PageHeaderBar from "../components/PageHeaderBar";
import { ui_main } from "../../resource/texts.json";
import { language } from "../constantsUI";
import LogoText from "../../resource/LogoText.png";

export default function Root() {
  const pageName = ui_main[language.current];
  return (
    <>
      <PageHeaderBar pageName={pageName} courseName="Test course" />
      <div className="content">
        <img src={LogoText} className="textLogo" />
      </div>
    </>
  );
}
