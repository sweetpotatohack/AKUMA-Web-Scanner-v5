# AKUMA WEB SCANNER - Scanner Engine Dockerfile
# Isolated Scanner Container with TURBO Engine
# By AKUMA & Феня - The Cyber Gods 🔥💀

FROM kalilinux/kali-rolling

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Update and install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    golang-go \
    git \
    curl \
    wget \
    unzip \
    nmap \
    masscan \
    massdns \
    dnsutils \
    whatweb \
    parallel \
    jq \
    ruby \
    ruby-dev \
    build-essential \
    libssl-dev \
    libffi-dev \
    pkg-config \
    nikto \
    dirb \
    gobuster \
    ffuf \
    hydra \
    sqlmap \
    amass \
    sublist3r \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Setup Go environment
ENV GOPATH=/root/go
ENV PATH=$PATH:/usr/local/go/bin:$GOPATH/bin

# Install Go-based tools
RUN go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest \
    && go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest \
    && go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest \
    && go install -v github.com/tomnomnom/assetfinder@latest \
    && go install -v github.com/OWASP/Amass/v3/...@master \
    && go install -v github.com/tomnomnom/waybackurls@latest \
    && go install -v github.com/tomnomnom/httprobe@latest \
    && go install -v github.com/hakluke/hakrawler@latest \
    && go install -v github.com/lc/gau@latest

# Install Ruby gems
RUN gem install wpscan

# Install Python tools
RUN pip3 install --break-system-packages \
    droopescan \
    dirsearch \
    photon-scanner \
    requests \
    beautifulsoup4 \
    lxml \
    redis \
    celery

# Download and update nuclei templates
RUN nuclei -update-templates

# Create directories
RUN mkdir -p /app/results \
    && mkdir -p /opt/SecLists \
    && mkdir -p /opt/wordlists \
    && mkdir -p /opt/nuclei-templates-bitrix \
    && mkdir -p /opt/check_bitrix

# Download SecLists
RUN git clone --depth 1 https://github.com/danielmiessler/SecLists.git /opt/SecLists

# Download additional tools
RUN git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl \
    && ln -sf /opt/testssl/testssl.sh /usr/local/bin/testssl

# Download Bitrix-specific tools
RUN git clone https://github.com/jhonnybonny/nuclei-templates-bitrix.git /opt/nuclei-templates-bitrix || true \
    && git clone https://github.com/k1rurk/check_bitrix.git /opt/check_bitrix || true

# Download DNS resolvers
RUN curl -s https://raw.githubusercontent.com/janmasarik/resolvers/master/resolvers.txt > /opt/massdns-resolvers.txt

# Copy AKUMA TURBO scanner
COPY akuma_turbo_scanner.py .
COPY scanner_worker.py .
COPY requirements.txt .

# Install Python requirements
RUN pip3 install --break-system-packages -r requirements.txt

# Create scanner user
RUN useradd -m -u 1000 scanner \
    && chown -R scanner:scanner /app \
    && chown -R scanner:scanner /opt

# Expose no ports (internal service)
EXPOSE 6379

# Health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s --retries=3 \
    CMD python3 -c "import redis; r=redis.Redis(host='redis'); r.ping()" || exit 1

# Switch to scanner user for security
USER scanner

# Start the scanner worker
CMD ["python3", "scanner_worker.py"]
