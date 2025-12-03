import { AliasManager } from "./aliases";

export interface VFSNode {
  type: "file" | "directory";
  name: string;
  content?: string;
  children?: Map<string, VFSNode>;
  permissions: string;
  created: Date;
  modified: Date;
}

export class VirtualFileSystem {
  private root: VFSNode;
  private aliasManager: AliasManager;

  constructor() {
    this.root = this.createDirectoryNode("");
    this.aliasManager = new AliasManager();

    // Essential directories
    this.createNestedDirectory("/bin");
    this.createNestedDirectory("/sbin");
    this.createNestedDirectory("/boot");
    this.createNestedDirectory("/lib");
    this.createNestedDirectory("/lib64");

    // Configuration
    this.createNestedDirectory("/etc/init.d");
    this.createNestedDirectory("/etc/systemd");
    this.createNestedDirectory("/etc/network");
    this.createNestedDirectory("/etc/ssh");

    // User directories
    this.createNestedDirectory("/home/visitor");
    this.createNestedDirectory("/home/pk2");
    this.createNestedDirectory("/home/pk2/.ssh");
    this.createNestedDirectory("/home/pk2/docs");
    this.createNestedDirectory("/home/pk2/projects");
    this.createNestedDirectory("/home/pk2/mentoring");
    this.createNestedDirectory("/home/pk2/lab");
    this.createNestedDirectory("/home/pk2/personal");
    this.createNestedDirectory("/root");

    // Variable data
    this.createNestedDirectory("/var/log");
    this.createNestedDirectory("/var/tmp");
    this.createNestedDirectory("/var/cache");
    this.createNestedDirectory("/var/www");
    this.createNestedDirectory("/var/mail");

    // User programs
    this.createNestedDirectory("/usr/bin");
    this.createNestedDirectory("/usr/sbin");
    this.createNestedDirectory("/usr/lib");
    this.createNestedDirectory("/usr/local/bin");
    this.createNestedDirectory("/usr/local/lib");
    this.createNestedDirectory("/usr/local/share");
    this.createNestedDirectory("/usr/share/doc");
    this.createNestedDirectory("/usr/share/man");

    // Other standard directories
    this.createNestedDirectory("/tmp");
    this.createNestedDirectory("/opt");
    this.createNestedDirectory("/mnt");
    this.createNestedDirectory("/proc");
    this.createNestedDirectory("/sys");
    this.createNestedDirectory("/dev");
    this.createNestedDirectory("/srv");

    // Initialize system files
    this.initializeSystemFiles();
  }

  private initializeSystemFiles(): void {
    // /etc/hostname
    this.createFile("/etc/hostname", "pk2-server\n");

    // /etc/passwd
    this.createFile("/etc/passwd", `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:102:105::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:103:106:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
syslog:x:104:111::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
visitor:x:1000:1000:Visitor,,,:/home/visitor:/bin/bash
pk2:x:1001:1001:Pete Karl II,,,:/home/pk2:/bin/bash
`);

    // /etc/group
    this.createFile("/etc/group", `root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:
adm:x:4:visitor
tty:x:5:
disk:x:6:
lp:x:7:
mail:x:8:
news:x:9:
uucp:x:10:
man:x:12:
proxy:x:13:
kmem:x:15:
dialout:x:20:
fax:x:21:
voice:x:22:
cdrom:x:24:visitor
floppy:x:25:
tape:x:26:
sudo:x:27:visitor
audio:x:29:
dip:x:30:visitor
www-data:x:33:
backup:x:34:
operator:x:37:
list:x:38:
irc:x:39:
src:x:40:
gnats:x:41:
shadow:x:42:
utmp:x:43:
video:x:44:
sasl:x:45:
plugdev:x:46:visitor
staff:x:50:
games:x:60:
users:x:100:
nogroup:x:65534:
visitor:x:1000:
`);

    // /etc/os-release
    this.createFile("/etc/os-release", `PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
VERSION_CODENAME=jammy
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=jammy
`);

    // /etc/lsb-release
    this.createFile("/etc/lsb-release", `DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu 22.04.3 LTS"
`);

    // /etc/motd (Message of the Day)
    this.createFile("/etc/motd", `
 /\$\$\$\$\$\$\$  /\$\$        /\$\$\$\$\$\$                /\$\$
| \$\$__  \$\$| \$\$       /\$\$__  \$\$              | \$\$
| \$\$  \\ \$\$| \$\$   /\$\$|__/  \\ \$\$      /\$\$\$\$\$\$\$| \$\$\$\$\$\$\$
| \$\$\$\$\$\$\$/| \$\$  /\$\$/  /\$\$\$\$\$\$/     /\$\$_____/| \$\$__  \$\$
| \$\$____/ | \$\$\$\$\$\$/  /\$\$____/     |  \$\$\$\$\$\$ | \$\$  \\ \$\$
| \$\$      | \$\$_  \$\$ | \$\$           \\____  \$\$| \$\$  | \$\$
| \$\$      | \$\$ \\  \$\$| \$\$\$\$\$\$\$\$ /\$\$| /\$\$\$\$\$\$\$/| \$\$  | \$\$
|__/      |__/  \\__/|________/|__/|_______/ |__/  |__/

`);

    // /etc/issue
    this.createFile("/etc/issue", `Ubuntu 22.04.3 LTS \\n \\l

`);

    // /etc/hosts
    this.createFile("/etc/hosts", `127.0.0.1	localhost
127.0.1.1	pk2-server

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
`);

    // /etc/resolv.conf
    this.createFile("/etc/resolv.conf", `nameserver 8.8.8.8
nameserver 8.8.4.4
search localdomain
`);

    // /etc/fstab
    this.createFile("/etc/fstab", `# /etc/fstab: static file system information.
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
/dev/sda1       /               ext4    errors=remount-ro 0       1
/dev/sda2       /home           ext4    defaults        0       2
tmpfs           /tmp            tmpfs   defaults        0       0
`);

    // /proc/version
    this.createFile("/proc/version", `Linux version 5.15.0-generic (buildd@lcy02-amd64-001) (gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #1 SMP Ubuntu
`);

    // /proc/cpuinfo
    this.createFile("/proc/cpuinfo", `processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model		: 142
model name	: Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz
stepping	: 10
microcode	: 0xf0
cpu MHz		: 1992.000
cache size	: 8192 KB
physical id	: 0
siblings	: 4
core id		: 0
cpu cores	: 2
apicid		: 0
initial apicid	: 0
fpu		: yes
fpu_exception	: yes
cpuid level	: 22
wp		: yes
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm constant_tsc arch_perfmon rep_good nopl xtopology cpuid pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch cpuid_fault invpcid_single ssbd ibrs ibpb stibp ibrs_enhanced fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid rdseed adx smap clflushopt xsaveopt xsavec xgetbv1 xsaves arat umip pku ospke
bugs		: spectre_v1 spectre_v2 spec_store_bypass swapgs itlb_multihit srbds mmio_stale_data retbleed
bogomips	: 3984.00
clflush size	: 64
cache_alignment	: 64
address sizes	: 39 bits physical, 48 bits virtual
power management:

processor	: 1
vendor_id	: GenuineIntel
cpu family	: 6
model		: 142
model name	: Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz
stepping	: 10
microcode	: 0xf0
cpu MHz		: 1992.000
cache size	: 8192 KB
physical id	: 0
siblings	: 4
core id		: 1
cpu cores	: 2
apicid		: 1
initial apicid	: 1
fpu		: yes
fpu_exception	: yes
cpuid level	: 22
wp		: yes
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm constant_tsc arch_perfmon rep_good nopl xtopology cpuid pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch cpuid_fault invpcid_single ssbd ibrs ibpb stibp ibrs_enhanced fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid rdseed adx smap clflushopt xsaveopt xsavec xgetbv1 xsaves arat umip pku ospke
bugs		: spectre_v1 spectre_v2 spec_store_bypass swapgs itlb_multihit srbds mmio_stale_data retbleed
bogomips	: 3984.00
clflush size	: 64
cache_alignment	: 64
address sizes	: 39 bits physical, 48 bits virtual
power management:
`);

    // /proc/meminfo
    this.createFile("/proc/meminfo", `MemTotal:        4000000 kB
MemFree:         1500000 kB
MemAvailable:    2300000 kB
Buffers:          200000 kB
Cached:           900000 kB
SwapCached:            0 kB
Active:          1200000 kB
Inactive:         800000 kB
Active(anon):     600000 kB
Inactive(anon):   200000 kB
Active(file):     600000 kB
Inactive(file):   600000 kB
Unevictable:           0 kB
Mlocked:               0 kB
SwapTotal:       2097152 kB
SwapFree:        2097152 kB
Dirty:                 0 kB
Writeback:             0 kB
AnonPages:        600000 kB
Mapped:           200000 kB
Shmem:             64000 kB
KReclaimable:     100000 kB
Slab:             150000 kB
SReclaimable:     100000 kB
SUnreclaim:        50000 kB
KernelStack:        8000 kB
PageTables:        20000 kB
NFS_Unstable:          0 kB
Bounce:                0 kB
WritebackTmp:          0 kB
CommitLimit:     4097152 kB
Committed_AS:    1500000 kB
VmallocTotal:   34359738367 kB
VmallocUsed:       30000 kB
VmallocChunk:          0 kB
Percpu:             2000 kB
HardwareCorrupted:     0 kB
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
ShmemPmdMapped:        0 kB
FileHugePages:         0 kB
FilePmdMapped:         0 kB
HugePages_Total:       0
HugePages_Free:        0
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:               0 kB
DirectMap4k:      100000 kB
DirectMap2M:     4000000 kB
DirectMap1G:           0 kB
`);

    // /proc/uptime
    this.createFile("/proc/uptime", `3600.00 14000.00
`);

    // /proc/loadavg
    this.createFile("/proc/loadavg", `0.00 0.00 0.00 1/95 1001
`);

    // /var/log/syslog (sample)
    this.createFile("/var/log/syslog", `Dec  2 00:00:00 pk2-server systemd[1]: Started System Logging Service.
Dec  2 00:00:01 pk2-server systemd[1]: Started Daily apt download activities.
Dec  2 00:00:02 pk2-server systemd[1]: Started Daily Cleanup of Temporary Directories.
Dec  2 00:00:03 pk2-server kernel: [    0.000000] Linux version 5.15.0-generic
Dec  2 00:00:04 pk2-server kernel: [    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.15.0-generic root=/dev/sda1
Dec  2 00:00:05 pk2-server kernel: [    0.000000] BIOS-provided physical RAM map:
Dec  2 00:00:06 pk2-server sshd[1000]: Server listening on 0.0.0.0 port 22.
Dec  2 00:00:07 pk2-server sshd[1000]: Server listening on :: port 22.
`);

    // /var/log/auth.log (sample)
    this.createFile("/var/log/auth.log", `Dec  2 00:00:00 pk2-server sshd[1000]: Server listening on 0.0.0.0 port 22.
Dec  2 00:00:01 pk2-server sshd[1000]: Server listening on :: port 22.
Dec  2 00:00:10 pk2-server login[1001]: pam_unix(login:session): session opened for user visitor
`);

    // /home/visitor/.bashrc
    this.createFile("/home/visitor/.bashrc", `# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command
shopt -s checkwinsize

# make less more friendly for non-text input files
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set a fancy prompt
PS1='\\u@\\h:\\w\\$ '

# enable color support of ls
alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Alias definitions
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
`);

    // /home/visitor/.profile
    this.createFile("/home/visitor/.profile", `# ~/.profile: executed by the command interpreter for login shells.

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi
`);

    // Create some sample files in /home/visitor
    this.createFile("/home/visitor/welcome.txt", `Welcome to the Ubuntu Server Terminal Emulator!

This is a simulated Ubuntu Server environment running in your browser.
You can explore the filesystem, run commands, and learn Linux basics.

Try these commands to get started:
  - ls -la          List files in current directory
  - cat /etc/os-release   View system information
  - uname -a        Display system details
  - help            Show all available commands

Have fun exploring!
`);

    // Initialize pk2 user files
    this.initializePk2Files();
  }

  private initializePk2Files(): void {
    // /home/pk2/README.txt
    this.createFile("/home/pk2/README.txt", `You found /home/pk2.

This is the home directory for Pete Karl II.
Inside are notes on past projects, mentoring, and a few personal favorites.

Use 'ls' to explore and 'cat' to read files.
`);

    // /home/pk2/.bashrc
    this.createFile("/home/pk2/.bashrc", `# ~/.bashrc for pk2

export EDITOR=vim
export VISUAL=vim

alias ll='ls -alF'
alias la='ls -A'
alias gs='git status'
alias gd='git diff'

PS1='pk2@\\h:\\w\\$ '
`);

    // /home/pk2/.profile
    this.createFile("/home/pk2/.profile", `# ~/.profile for pk2

if [ -n "$BASH_VERSION" ]; then
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi
`);

    // /home/pk2/.ssh/authorized_keys
    this.createFile("/home/pk2/.ssh/authorized_keys", `# SSH keys (simulated)
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAISimulatedKey pk2@localhost
`);

    // /home/pk2/docs/resume.txt
    this.createFile("/home/pk2/docs/resume.txt", `PETE KARL II
Engineering Leadership
Atlanta, GA

EXPERIENCE

Avnir (2023-Present)
  Startup CTO - AI copilot platform

Thrive Global (2021-2023)
  VP Engineering

SilverCloud Health (2020-2021)
  Head of Engineering

WEVO (2019-2020)
  Head of Product & Engineering

Drift (2016-2019)
  Senior Lead, Engineering
`);

    // /home/pk2/docs/stack.txt
    this.createFile("/home/pk2/docs/stack.txt", `TECH STACK NOTES

Data: BigQuery, dbt, vector databases
Cloud: GCP, Cloudflare
Frontend: React, React Native, TypeScript
Integrations: MS Teams, EHR systems (Epic, Cerner)
Compliance: SOC2, HiTRUST, HIPAA
`);

    // /home/pk2/projects/notes.txt
    this.createFile("/home/pk2/projects/notes.txt", `PROJECT NOTES

Avnir
  AI copilot for professional services
  Contact intelligence pipeline using BigQuery + dbt

Thrive Global
  Wellbeing platform (Arianna Huffington's company)
  React Native mobile, MS Teams integration

SilverCloud Health
  Digital therapeutics platform
  EHR integrations with Epic and Cerner
  Acquired by Amwell

Drift
  Conversational marketing platform
  Bot automation and demo booking

WEVO
  AI-powered UX analytics
`);

    // /home/pk2/mentoring/playbook.txt
    this.createFile("/home/pk2/mentoring/playbook.txt", `MENTORING NOTES

First meeting:
  Ask what success looks like for them
  Understand current challenges
  Find out what they've already tried
  Listen more than talk

Ongoing:
  Focus on customer outcomes
  Challenge assumptions gently
  Help see the bigger picture

Programs:
  HackBeanpot (2019-present)
  Startup Institute (2013-present)
  Code with Me (2013-present)
`);

    // /home/pk2/lab/ideas.txt
    this.createFile("/home/pk2/lab/ideas.txt", `IDEAS (BRAIN DUMP)

Copilot for discovery calls
Auto-generate follow-ups from call transcripts
Codebase Q&A for onboarding
Meeting summarizer that knows your priorities

Principles:
  Augment humans, don't replace them
  Start with the workflow, not the model
  Privacy is a feature
`);

    // /home/pk2/personal/about.txt
    this.createFile("/home/pk2/personal/about.txt", `ABOUT

Name: Pete Karl II
Location: Atlanta, Georgia
Education: Rochester Institute of Technology

I work on engineering leadership and AI products.
I like mentoring and teaching.

Contact: pete.karl@gmail.com
LinkedIn: linkedin.com/in/pkarl2
`);

    // /home/pk2/personal/reading.txt
    this.createFile("/home/pk2/personal/reading.txt", `READING LIST

Books:
  The Manager's Path - Camille Fournier
  An Elegant Puzzle - Will Larson
  Accelerate - Forsgren, Humble, Kim
  The Mom Test - Rob Fitzpatrick

Blogs:
  Will Larson's Irrational Exuberance
  Lenny's Newsletter
  First Round Review
`);

    // /home/pk2/personal/cities.txt
    this.createFile("/home/pk2/personal/cities.txt", `CITIES

Lived in:
  Rochester, NY
  Boston, MA
  Atlanta, GA (current)
`);
  }

  private createDirectoryNode(name: string): VFSNode {
    return {
      type: "directory",
      name,
      children: new Map(),
      permissions: "drwxr-xr-x",
      created: new Date(),
      modified: new Date(),
    };
  }

  private createFileNode(name: string, content: string = ""): VFSNode {
    return {
      type: "file",
      name,
      content,
      permissions: "-rw-r--r--",
      created: new Date(),
      modified: new Date(),
    };
  }

  private createNestedDirectory(path: string): VFSNode {
    const parts = path.split("/").filter((p) => p !== "");
    let current = this.root;

    for (const part of parts) {
      if (!current.children!.has(part)) {
        const newNode = this.createDirectoryNode(part);
        current.children!.set(part, newNode);
      }
      current = current.children!.get(part)!;
    }

    return current;
  }

  /**
   * Register a new alias in the alias manager
   * @param alias - The alias to register
   * @param path - The path it expands to
   */
  setAlias(alias: string, path: string): void {
    this.aliasManager.setAlias(alias, path);
  }

  /**
   * Look up an alias in the alias manager
   * @param alias - The alias to look up
   * @returns The expanded path or undefined
   */
  getAlias(alias: string): string | undefined {
    return this.aliasManager.getAlias(alias);
  }

  /**
   * Expand an alias in a path
   * @param path - The path potentially containing an alias
   * @returns The expanded path
   */
  expandAlias(path: string): string {
    return this.aliasManager.expandAlias(path);
  }

  /**
   * Reverse expand a path to an alias if possible
   * @param path - The path to convert to an alias
   * @returns The aliased version or original path
   */
  reverseExpandAlias(path: string): string {
    return this.aliasManager.reverseExpandAlias(path);
  }

  resolvePath(currentPath: string, targetPath: string): string {
    // Expand aliases first
    targetPath = this.expandAlias(targetPath);

    // If absolute path, use it directly
    if (targetPath.startsWith("/")) {
      currentPath = targetPath;
    } else {
      // Relative path - build from current
      if (currentPath !== "/") {
        currentPath += "/" + targetPath;
      } else {
        currentPath = "/" + targetPath;
      }
    }

    // Normalize path: handle . and ..
    const parts = currentPath.split("/").filter((p) => p !== "");
    const normalized: string[] = [];

    for (const part of parts) {
      if (part === ".") {
        continue;
      } else if (part === "..") {
        normalized.pop();
      } else {
        normalized.push(part);
      }
    }

    return "/" + normalized.join("/");
  }

  getNode(path: string): VFSNode | null {
    if (path === "/") return this.root;

    const parts = path.split("/").filter((p) => p !== "");
    let current = this.root;

    for (const part of parts) {
      if (current.type !== "directory" || !current.children) {
        return null;
      }
      const next = current.children.get(part);
      if (!next) return null;
      current = next;
    }

    return current;
  }

  createDirectory(path: string): boolean {
    const parts = path.split("/").filter((p) => p !== "");
    if (parts.length === 0) return false;

    const name = parts[parts.length - 1];
    const parentPath = "/" + parts.slice(0, -1).join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "directory") {
      return false;
    }

    if (parent.children!.has(name)) {
      return false; // Already exists
    }

    parent.children!.set(name, this.createDirectoryNode(name));
    parent.modified = new Date();
    return true;
  }

  createFile(path: string, content: string = ""): boolean {
    const parts = path.split("/").filter((p) => p !== "");
    if (parts.length === 0) return false;

    const name = parts[parts.length - 1];
    const parentPath = "/" + parts.slice(0, -1).join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "directory") {
      return false;
    }

    if (parent.children!.has(name)) {
      return false; // Already exists
    }

    parent.children!.set(name, this.createFileNode(name, content));
    parent.modified = new Date();
    return true;
  }

  listDirectory(path: string): VFSNode[] {
    const node = this.getNode(path);
    if (!node || node.type !== "directory" || !node.children) {
      return [];
    }

    // Create special directory entries for . and ..
    const entries: VFSNode[] = [];

    // Add . (current directory)
    entries.push({
      type: "directory",
      name: ".",
      children: new Map(),
      permissions: "drwxr-xr-x",
      created: node.created,
      modified: node.modified,
    });

    // Add .. (parent directory) - in root, .. points to itself
    entries.push({
      type: "directory",
      name: "..",
      children: new Map(),
      permissions: "drwxr-xr-x",
      created: this.root.created,
      modified: this.root.modified,
    });

    // Add regular directory contents
    entries.push(...Array.from(node.children.values()));

    return entries;
  }

  changeDirectory(
    currentPath: string,
    targetPath: string
  ): string | { error: string } {
    const newPath = this.resolvePath(currentPath, targetPath);
    const node = this.getNode(newPath);

    if (!node) {
      return { error: `cd: ${targetPath}: No such file or directory` };
    }

    if (node.type !== "directory") {
      return { error: `cd: ${targetPath}: Not a directory` };
    }

    return newPath;
  }

  deleteNode(path: string): boolean {
    if (path === "/") return false;

    const parts = path.split("/").filter((p) => p !== "");
    const name = parts[parts.length - 1];
    const parentPath = "/" + parts.slice(0, -1).join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "directory") {
      return false;
    }

    const hasChild = parent.children!.has(name);
    if (hasChild) {
      parent.children!.delete(name);
      parent.modified = new Date();
      return true;
    }

    return false;
  }

  readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== "file") {
      return null;
    }
    return node.content || "";
  }

  /**
   * Get a display-friendly version of a path
   * Converts paths to their alias equivalents if available
   * @param currentPath - The path to display
   * @returns The path or its alias equivalent
   */
  getPathDisplay(currentPath: string): string {
    return this.reverseExpandAlias(currentPath);
  }
}
