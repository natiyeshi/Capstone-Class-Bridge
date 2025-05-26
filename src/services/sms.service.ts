import axios from 'axios';

const SMS_API_TOKEN = process.env.SMS_API_TOKEN || 'YOUR_TOKEN';
const SMS_SENDER = process.env.SMS_SENDER || 'YOUR_SENDER_NAME';
const SMS_FROM = process.env.SMS_FROM || 'YOUR_IDENTIFIER_ID';
const SMS_CALLBACK = process.env.SMS_CALLBACK || 'YOUR_CALLBACK';

const smsApi = axios.create({
  baseURL: 'https://api.afromessage.com/api',
  headers: {
    'Authorization': `Bearer ${SMS_API_TOKEN}`
  }
});

export const sendSMS = async (msg : string) => {
  const data = {			
    "callback": "/test",
    "from":"e80ad9d8-adf3-463f-80f4-7c4b39f7f164",
    "sender":"AfroMessage",
    "to": "251945954712",
    "message": msg
  }

   smsApi.post('/send', data)
}

export const sendVerificationOTP = async (phoneNumber: string) => {
  try {
    const response = await smsApi.get('/challenge', {
      params: {
        from: SMS_FROM,
        sender: SMS_SENDER,
        to: phoneNumber,
        pr: 'Your verification code is', // prefix
        ps: 'Thank you for verifying your phone number.', // postfix
        callback: SMS_CALLBACK,
        sb: 1, // spaces before
        sa: 1, // spaces after
        ttl: 300, // time to live in seconds (5 minutes)
        len: 6, // code length
        t: 1 // code type (1 for numeric)
      }
    });

    if (response.status === 200 && response.data.acknowledge === 'success') {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: 'Failed to send verification code'
    };
  } catch (error) {
    console.error('SMS API Error:', error);
    return {
      success: false,
      error: 'Failed to send verification code'
    };
  }
};

export const verifyOTP = async (phoneNumber: string, code: string) => {
  try {
    const response = await smsApi.get('/verify', {
      params: {
        to: phoneNumber,
        code: code
      }
    });

    if (response.status === 200 && response.data.acknowledge === 'success') {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: 'Invalid verification code'
    };
  } catch (error) {
    console.error('SMS API Error:', error);
    return {
      success: false,
      error: 'Failed to verify code'
    };
  }
}; 