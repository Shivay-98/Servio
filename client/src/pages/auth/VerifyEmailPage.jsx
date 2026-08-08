import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { verifyEmail } from '../../services/auth.service';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    if (token) verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h2 className="mt-4 text-xl font-semibold">Verifying Your Email</h2>
                <p className="mt-2 text-sm text-muted-foreground">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Email Verified!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your email has been verified successfully. You can now sign in to your account.
                </p>
                <Button asChild className="mt-6 w-full">
                  <Link to="/login">Continue to Sign In</Link>
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Verification Failed</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  The verification link is invalid or has expired. Please try registering again or contact support.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <Button asChild>
                    <Link to="/register">Register Again</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/login">Back to Sign In</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
