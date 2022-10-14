import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, login, logout } from './features/userSlice';
import { auth } from './firebase';
import styles from './App.module.css';
import Feed from './components/Feed';
import Auth from './components/Auth';

const App: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    //firebaseのユーザーに対して変化があった時に呼び出される関数
    const unSub = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          //loginが実行されてfirebaseで用意されている
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        //logoutの空文字列のオブジェクトが代入されてリセットされる
        dispatch(logout());
      }
    });
    return () => {
      unSub();
    };
  }, [dispatch]);
  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default App;
