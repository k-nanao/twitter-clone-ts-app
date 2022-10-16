import React, { useState } from 'react';
import styles from './TweetInput.module.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { auth, storage, db } from '../firebase';
import { Avatar, Button, IconButton } from '@material-ui/core';
import firebase from 'firebase/app';
import AddaPhotoIcon from '@material-ui/icons/AddAPhoto';

const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);
  //ツイートのメッセージを格納
  const [tweetMsg, setTweetMsg] = useState<string>('');
  //ツイートの画像を格納
  const [tweetImage, setTweetImage] = useState<File | null>(null);

  //ユーザーが画像を選択した時に実行される関数
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = '';
    }
  };

  //tweetボタンを押したら実行される
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tweetImage) {
      //イメージをstorageに保存
      const S =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('');
      const fileName = randomChar + '_' + tweetImage.name;
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);
      //storageの返り値
      uploadTweetImg.on(
        //三つの機能
        firebase.storage.TaskEvent.STATE_CHANGED,
        //進捗
        () => {},
        //エラーハンドリング
        (err) => {
          alert(err.message);
        },
        //正常終了
        async () => {
          //アップロード完了したurl取得
          await storage
            .ref('images')
            .child(fileName)
            .getDownloadURL()
            .then(async (url) => {
              //ファイルのurlリンクの取得に成功したらcloudのfirestoreにアップロード
              await db.collection('posts').add({
                //追加するオブジェクトの内容を定義
                avatar: user.photoUrl,
                image: url,
                text: tweetMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName,
              });
            });
        }
      );
    } else {
      //ツイートにイメージがない時
      db.collection('posts').add({
        //データベースに追加していく時に登録する属性定義
        avatar: user.photoUrl,
        image: '',
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMsg('');
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            type='text'
            placeholder='what happenning'
            className={styles.tweet_input}
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddaPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type='file'
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type='submit'
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
