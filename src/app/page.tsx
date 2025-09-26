export default function Home() {
    return (
        <main style={{ padding: 24, fontFamily: "sans-serif" }}>
            <h1>Next.js Skeleton ✅</h1>
            <p>프론트 서버가 정상 구동 중입니다.</p>
            <p>
                Health:{" "}
                <a href="/healthz" target="_blank">
                    /healthz
                </a>
            </p>
        </main>
    );
}
