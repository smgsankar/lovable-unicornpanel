import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import MainLayout from './layouts/MainLayout';
import BlankScreen from './pages/BlankScreen';
import { HomeScreen } from './modules/lovablehomemodule';
import { SellerListScreen, SellerFormScreen, SellerViewScreen } from './modules/udhsellermodule';
import NotFound from './pages/NotFound';
import './App.css';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#45469D',
          colorError: '#F94949',
          colorBgContainer: '#FFFFFF',
          colorBgLayout: '#F6F6F6',
          colorText: '#4D4D4D',
          colorTextHeading: '#1A1A1A',
          borderRadius: 4,
        },
      }}
    >
      <Router>
        <MainLayout>
          <Switch>
            <Route exact path="/" component={BlankScreen} />
            <Route exact path="/lovablehomemodule/home" component={HomeScreen} />
            <Route exact path="/udhsellermodule/sellers" component={SellerListScreen} />
            <Route exact path="/udhsellermodule/create" component={SellerFormScreen} />
            <Route exact path="/udhsellermodule/edit" component={SellerFormScreen} />
            <Route exact path="/udhsellermodule/view" component={SellerViewScreen} />
            <Route path="*" component={NotFound} />
          </Switch>
        </MainLayout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
