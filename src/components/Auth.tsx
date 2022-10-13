import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import styles from './Auth.module.css';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { auth, provider, storage } from '../firebase';
import SendIcon from '@material-ui/icons/Send';
import CameraIcon from '@material-ui/icons/Camera';
import EmailIcon from '@material-ui/icons/Email';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { updateUserProfile } from '../features/userSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage:
      'url(https://images.unsplash.com/photo-1661347334036-d484f970b1a1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2787&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Auth: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  //メールとパスワードの機能
  const [email, setEmail] = useState<string>('');
  const [password, setPassWord] = useState<string>('');
  //ユーザーが入力したユーザーネームを格納
  const [username, setUsername] = useState<string>('');
  //ユーザーが設定したアバター画像を格納
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  //ログイン、レジスターモード(アカウントをまだ持っていない)
  const [isLogin, setLogin] = useState<boolean>(true);

  //ユーザーが画像を選択した時に実行される関数
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    //配列内で選択された画像データのみを
    //nonnullable アサーション。tsのコンパイラーにnull or undifinedではないことを明記。オブジェクトがnullである可能性のものにアクセスできないように
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      //連続して同じ画像ファイルがが選択されると反応しない仕様になっているが、反応できるように初期化している
      e.target.value = '';
    }
  };

  //サインインする時に実行される関数
  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  //サインアップ時に実行される関数
  const signUpEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    //firebaseのcloudstorageに保存された時に識別URL
    let url = '';
    if (avatarImage) {
      const S =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        //0-61の生成された文字列をjoin関数で結合させて
        .join('');
      //ユニークなファイル名を作っている。
      const fileName = randomChar + '_' + avatarImage.name;
      //フォルダの階層を指定してstorageに保存。
      await storage.ref(`avatars/${fileName}`).put(avatarImage);
      //保存した画像のurlを取得
      url = await storage.ref('avatars').child(fileName).getDownloadURL();
    }
    await authUser.user?.updateProfile({
      displayName: username,
      photoURL: url,
    });
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  //Googleサインイン機能
  const signInGoogle = async () => {
    await auth.signInWithPopup(provider).catch((e) => alert(e.message));
  };

  //ログインモードとレジスターモードの表示文字を変更する関数
  const handleLogin = () => {
    setLogin(!isLogin);
  };

  //メール欄に打ち込まれる文字を読み込む関数
  const handleEmailChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setEmail(e.target.value);
  };

  //パスワード欄に打ち込まれる文字を読み込む関数
  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPassWord(e.target.value);
  };

  return (
    <Grid container component='main' className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            {isLogin ? 'Login' : 'Register'}
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              value={email}
              onChange={(e) => handleEmailChange(e)}
            />
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => handlePasswordChange(e)}
            />
            <Button
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                  ? //ログインモード
                    async () => {
                      try {
                        await signInEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
                  : //レジスターモード
                    async () => {
                      try {
                        await signUpEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
              }
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
            <Grid container>
              <Grid item xs>
                <span className={styles.login_reset}>forgot password?</span>
              </Grid>
              <Grid item>
                {/* ログインとレジスターモードの切り替えをトグルする */}
                <span
                  className={styles.login_toggleMode}
                  onClick={() => handleLogin()}
                >
                  {isLogin ? 'Create new account ?' : 'Back to login'}
                </span>
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              onClick={signInGoogle}
            >
              SignIn with Google
            </Button>
          </form>
        </div>
      </Grid>
    </Grid>
  );
};

export default Auth;
