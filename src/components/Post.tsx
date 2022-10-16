import React, { useState, useEffect } from 'react';
import styles from './Post.module.css';
import firebase from 'firebase';
import { db } from '../firebase';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MessageIcon from '@material-ui/icons/Message';
import SendIcon from '@material-ui/icons/Send';

//typescriptでpropsで渡す場合は、データ型を定義する必要があるので
interface PROPS {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS> = (props) => {
  //コメントのアイコンを小さくするためのmaterial uiの機能を引用
  const classes = useStyles();
  const user = useSelector(selectUser);
  //コメントを制御
  const [comment, setComment] = useState<string>('');
  //コメントの一覧を制御
  const [comments, setComments] = useState<COMMENT[]>([
    //初期値
    {
      id: '',
      avatar: '',
      text: '',
      username: '',
      timestamp: null,
    },
  ]);
  //コメントを表示、非表示の制御
  const [openComments, setOpenComments] = useState<boolean>(false);

  useEffect(() => {
    const unSub = db
      .collection('posts')
      .doc(props.postId)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });

    return () => {
      unSub();
    };
  }, [props.postId]);

  //コメントを入力して、submitボタンを押した時に実行される関数
  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.collection('posts').doc(props.postId).collection('comments').add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });
    setComment('');
  };
  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{props.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && (
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt='tweet' />
          </div>
        )}

        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />

        {openComments && (
          <>
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} className={classes.small} />

                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_commentText}>{com.text} </span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type='text'
                  placeholder='Type new comment...'
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                  type='submit'
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
