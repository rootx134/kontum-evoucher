import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Hardcode tài khoản admin theo yêu cầu
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Monx134@';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Đăng nhập thành công, tạo cookie an toàn
      const response = NextResponse.json(
        { success: true, message: 'Đăng nhập thành công' },
        { status: 200 }
      );
      
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 tuần
        path: '/',
      });

      return response;
    }

    // Đăng nhập thất bại
    return NextResponse.json(
      { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}
