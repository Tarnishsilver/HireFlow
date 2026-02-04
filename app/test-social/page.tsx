
import SocialCheck from '@/components/social-check/SocialCheck';

export default function SocialTestPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Social Check Tool</h1>
                    <p className="text-slate-600 mt-2">Test the background check integration</p>
                </div>

                <SocialCheck />
            </div>
        </div>
    );
}
