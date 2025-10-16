import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ConfigProvider, ThemeConfig } from "antd";
import MainLayout from "./layouts/MainLayout";
import BlankScreen from "./pages/BlankScreen";
import { HomeScreen } from "./modules/lovablehomemodule";
import {
  SellerListScreen,
  SellerFormScreen,
  SellerViewScreen,
} from "./modules/udhsellermodule";
import {
  ClaimSubmissionListScreen,
  ClaimSubmissionFormScreen,
  ClaimSubmissionViewScreen,
  RomSubmissionApprovalScreen,
  UdhTigerSubmissionApprovalScreen,
} from "./modules/fmcgclaimmodule";
import NotFound from "./pages/NotFound";
import "./App.css";

const themeConfig: ThemeConfig = {
  token: {
    // Primary Colors
    colorPrimary: "#45469D", // UNICORN_BLUE_PRIMARY
    colorPrimaryBg: "#ECEDF5", // UNICORN_BLUE_TINT_4
    colorPrimaryBgHover: "#BEBFDC", // UNICORN_BLUE_TINT_3
    colorPrimaryBorder: "#9B9DCB", // UNICORN_BLUE_TINT_2
    colorPrimaryBorderHover: "#6D6EB2", // UNICORN_BLUE_TINT_1
    colorPrimaryHover: "#6D6EB2", // UNICORN_BLUE_TINT_1
    colorPrimaryActive: "#262859", // UNICORN_BLUE_DARK
    colorPrimaryTextHover: "#6D6EB2", // UNICORN_BLUE_TINT_1
    colorPrimaryText: "#45469D", // UNICORN_BLUE_PRIMARY
    colorPrimaryTextActive: "#262859", // UNICORN_BLUE_DARK

    // Secondary/Accent Colors (using unicorn pink)
    colorLink: "#45469d", // Used for links in unicorn theme
    colorLinkHover: "#6D6EB2",
    colorLinkActive: "#262859",

    // Semantic Colors
    colorSuccess: "#18c081", // SEMANTIC_SUCCESS_GREEN_PRIMARY
    colorSuccessBg: "#ebfbf4", // SEMANTIC_SUCCESS_GREEN_TINT_2
    colorSuccessBorder: "#74d9b3", // SEMANTIC_SUCCESS_GREEN_TINT_1

    colorWarning: "#ff991a", // SEMANTIC_WARNING_ORANGE_PRIMARY
    colorWarningBg: "#fff7ec", // SEMANTIC_WARNING_ORANGE_TINT_2
    colorWarningBorder: "#ffcc8d", // SEMANTIC_WARNING_ORANGE_TINT_1

    colorError: "#f94949", // SEMANTIC_DANGER_RED_PRIMARY
    colorErrorBg: "#fef4ef", // SEMANTIC_DANGER_RED_TINT_2
    colorErrorBorder: "#fca4a4", // SEMANTIC_DANGER_RED_TINT_1

    colorInfo: "#1890ff", // SEMANTIC_INFO_BLUE_PRIMARY
    colorInfoBg: "#f2f8fe", // SEMANTIC_INFO_BLUE_TINT_2
    colorInfoBorder: "#8cc8ff", // SEMANTIC_INFO_BLUE_TINT_1

    // Text Colors
    colorText: "#1a1a1a", // Primary text color
    colorTextSecondary: "#666666", // GRAY_40
    colorTextTertiary: "#999999", // GRAY_60
    colorTextQuaternary: "#cccccc", // GRAY_80

    // Background Colors
    colorBgBase: "#ffffff", // WHITE
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f6f6f6", // GRAY_95
    colorBgSpotlight: "#ECEDF5", // UNICORN_BLUE_TINT_4
    colorBgMask: "rgba(0, 0, 0, 0.45)",

    // Border Colors
    colorBorder: "#dfdfdf", // BORDER_COLOR
    colorBorderSecondary: "#e6e6e6", // GRAY_90

    // Font
    fontFamily: "lato",
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,

    // Border Radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Control Heights
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
    controlHeightXS: 16,

    // Line Height
    lineHeight: 1.5714285714285714,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,

    // Motion
    motionDurationFast: "0.1s",
    motionDurationMid: "0.2s",
    motionDurationSlow: "0.3s",
  },
  components: {
    Button: {
      primaryColor: "#ffffff",
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
      colorPrimaryActive: "#262859",
      defaultBorderColor: "#45469D",
      defaultColor: "#45469D",
    },
    Input: {
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
      activeBorderColor: "#45469D",
      hoverBorderColor: "#6D6EB2",
    },
    Select: {
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
      optionSelectedBg: "#ECEDF5",
    },
    Table: {
      headerBg: "#f6f6f6",
      headerColor: "#1a1a1a",
      rowHoverBg: "#ECEDF5",
      rowSelectedBg: "#BEBFDC",
      rowSelectedHoverBg: "#9B9DCB",
    },
    Badge: {
      colorPrimary: "#ED3A97", // UNICORN_PINK_PRIMARY (as used in Badge component)
      colorText: "#ffffff",
    },
    Tag: {
      colorPrimary: "#45469D",
      colorPrimaryBg: "#ECEDF5",
      colorPrimaryBorder: "#9B9DCB",
    },
    Tabs: {
      itemSelectedColor: "#45469D",
      itemHoverColor: "#6D6EB2",
      itemActiveColor: "#262859",
      cardBg: "#ffffff",
    },
    DatePicker: {
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
      activeBorderColor: "#45469D",
    },
    Pagination: {
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
    },
    Switch: {
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
    },
    Checkbox: {
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
    },
    Radio: {
      colorPrimary: "#45469D",
      colorPrimaryHover: "#6D6EB2",
    },
  },
};

const App = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <BrowserRouter>
        <MainLayout>
          <Switch>
            <Route exact path="/" component={BlankScreen} />
            <Route
              exact
              path="/lovablehomemodule/home"
              component={HomeScreen}
            />
            <Route
              exact
              path="/udhsellermodule/sellers"
              component={SellerListScreen}
            />
            <Route
              exact
              path="/udhsellermodule/create"
              component={SellerFormScreen}
            />
            <Route
              exact
              path="/udhsellermodule/edit"
              component={SellerFormScreen}
            />
            <Route
              exact
              path="/udhsellermodule/view"
              component={SellerViewScreen}
            />
            <Route
              exact
              path="/fmcgclaimmodule/claimsubmissionlist"
              component={ClaimSubmissionListScreen}
            />
            <Route
              exact
              path="/fmcgclaimmodule/claimsubmissioncreate"
              component={ClaimSubmissionFormScreen}
            />
            <Route
              exact
              path="/fmcgclaimmodule/claimsubmissionedit"
              component={ClaimSubmissionFormScreen}
            />
            <Route
              exact
              path="/fmcgclaimmodule/claimsubmissionview"
              component={ClaimSubmissionViewScreen}
            />
            <Route
              exact
              path="/fmcgclaimmodule/romsubmissionapproval"
              component={RomSubmissionApprovalScreen}
            />
            <Route
              exact
              path="/fmcgclaimmodule/udhtigersubmissionapproval"
              component={UdhTigerSubmissionApprovalScreen}
            />
            <Route path="*" component={NotFound} />
          </Switch>
        </MainLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
