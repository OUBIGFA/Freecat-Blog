tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#374151",
                "background-light": "#f6f6f8",
                "background-dark": "#101622",
                "card-dark": "#1A2332",
            },
            fontFamily: {
                "display": ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "'微软雅黑'", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
}
