"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/terminal/aliases.ts
  var AliasManager = class {
    constructor() {
      __publicField(this, "aliases");
      this.aliases = /* @__PURE__ */ new Map();
      this.initializeDefaultAliases();
    }
    /**
     * Initialize default aliases - can be extended by calling setAlias()
     */
    initializeDefaultAliases() {
      this.setAlias("~", "/home/visitor");
      this.setAlias("~visitor", "/home/visitor");
    }
    /**
     * Register a new alias
     * @param alias - The alias string (e.g., "~", "~/bin")
     * @param path - The path it should expand to (e.g., "/home/visitor")
     */
    setAlias(alias, path) {
      this.aliases.set(alias, path);
    }
    /**
     * Look up an alias
     * @param alias - The alias to look up
     * @returns The expanded path or undefined if not found
     */
    getAlias(alias) {
      return this.aliases.get(alias);
    }
    /**
     * Expand an alias in a path
     * Handles both exact matches (~ → /home/visitor) and path-based (~/foo → /home/visitor/foo)
     * @param path - The path potentially containing an alias
     * @returns The expanded path
     */
    expandAlias(path) {
      const sortedAliases = Array.from(this.aliases.entries()).sort(
        (a, b) => b[0].length - a[0].length
      );
      for (const [alias, aliasPath] of sortedAliases) {
        if (path === alias) {
          return aliasPath;
        }
        if (path.startsWith(alias + "/")) {
          return aliasPath + path.slice(alias.length);
        }
      }
      return path;
    }
    /**
     * Reverse expand a path back to an alias if possible
     * Converts /home/visitor → ~ or /home/visitor/foo → ~/foo
     * @param path - The path to potentially convert to an alias
     * @returns The aliased path, or the original path if no alias matches
     */
    reverseExpandAlias(path) {
      const sortedAliases = Array.from(this.aliases.entries()).sort(
        (a, b) => b[1].length - a[1].length
      );
      for (const [alias, aliasPath] of sortedAliases) {
        if (path === aliasPath) {
          return alias;
        }
        if (path.startsWith(aliasPath + "/")) {
          return alias + path.slice(aliasPath.length);
        }
      }
      return path;
    }
    /**
     * Get all registered aliases
     * @returns Map of all aliases
     */
    getAllAliases() {
      return new Map(this.aliases);
    }
    /**
     * Check if a string is an alias
     * @param str - The string to check
     * @returns True if the string is a registered alias
     */
    isAlias(str) {
      return this.aliases.has(str);
    }
  };

  // src/terminal/filesystem.ts
  var VirtualFileSystem = class {
    constructor() {
      __publicField(this, "root");
      __publicField(this, "aliasManager");
      this.root = this.createDirectoryNode("");
      this.aliasManager = new AliasManager();
      this.createNestedDirectory("/bin");
      this.createNestedDirectory("/sbin");
      this.createNestedDirectory("/boot");
      this.createNestedDirectory("/lib");
      this.createNestedDirectory("/lib64");
      this.createNestedDirectory("/etc/init.d");
      this.createNestedDirectory("/etc/systemd");
      this.createNestedDirectory("/etc/network");
      this.createNestedDirectory("/etc/ssh");
      this.createNestedDirectory("/home/visitor");
      this.createNestedDirectory("/home/pk2");
      this.createNestedDirectory("/home/pk2/.ssh");
      this.createNestedDirectory("/home/pk2/docs");
      this.createNestedDirectory("/home/pk2/projects");
      this.createNestedDirectory("/home/pk2/mentoring");
      this.createNestedDirectory("/home/pk2/lab");
      this.createNestedDirectory("/home/pk2/personal");
      this.createNestedDirectory("/root");
      this.createNestedDirectory("/var/log");
      this.createNestedDirectory("/var/tmp");
      this.createNestedDirectory("/var/cache");
      this.createNestedDirectory("/var/www");
      this.createNestedDirectory("/var/mail");
      this.createNestedDirectory("/usr/bin");
      this.createNestedDirectory("/usr/sbin");
      this.createNestedDirectory("/usr/lib");
      this.createNestedDirectory("/usr/local/bin");
      this.createNestedDirectory("/usr/local/lib");
      this.createNestedDirectory("/usr/local/share");
      this.createNestedDirectory("/usr/share/doc");
      this.createNestedDirectory("/usr/share/man");
      this.createNestedDirectory("/tmp");
      this.createNestedDirectory("/opt");
      this.createNestedDirectory("/mnt");
      this.createNestedDirectory("/proc");
      this.createNestedDirectory("/sys");
      this.createNestedDirectory("/dev");
      this.createNestedDirectory("/srv");
      this.initializeSystemFiles();
    }
    initializeSystemFiles() {
      this.createFile("/etc/hostname", "pk2-server\n");
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
      this.createFile("/etc/lsb-release", `DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu 22.04.3 LTS"
`);
      this.createFile("/etc/motd", `
  +----------------+
  |     pk2.sh     |
  +----------------+

  Type 'help' for available commands.

`);
      this.createFile("/etc/issue", `Ubuntu 22.04.3 LTS \\n \\l

`);
      this.createFile("/etc/hosts", `127.0.0.1	localhost
127.0.1.1	pk2-server

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
`);
      this.createFile("/etc/resolv.conf", `nameserver 8.8.8.8
nameserver 8.8.4.4
search localdomain
`);
      this.createFile("/etc/fstab", `# /etc/fstab: static file system information.
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
/dev/sda1       /               ext4    errors=remount-ro 0       1
/dev/sda2       /home           ext4    defaults        0       2
tmpfs           /tmp            tmpfs   defaults        0       0
`);
      this.createFile("/proc/version", `Linux version 5.15.0-generic (buildd@lcy02-amd64-001) (gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #1 SMP Ubuntu
`);
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
      this.createFile("/proc/uptime", `3600.00 14000.00
`);
      this.createFile("/proc/loadavg", `0.00 0.00 0.00 1/95 1001
`);
      this.createFile("/var/log/syslog", `Dec  2 00:00:00 pk2-server systemd[1]: Started System Logging Service.
Dec  2 00:00:01 pk2-server systemd[1]: Started Daily apt download activities.
Dec  2 00:00:02 pk2-server systemd[1]: Started Daily Cleanup of Temporary Directories.
Dec  2 00:00:03 pk2-server kernel: [    0.000000] Linux version 5.15.0-generic
Dec  2 00:00:04 pk2-server kernel: [    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.15.0-generic root=/dev/sda1
Dec  2 00:00:05 pk2-server kernel: [    0.000000] BIOS-provided physical RAM map:
Dec  2 00:00:06 pk2-server sshd[1000]: Server listening on 0.0.0.0 port 22.
Dec  2 00:00:07 pk2-server sshd[1000]: Server listening on :: port 22.
`);
      this.createFile("/var/log/auth.log", `Dec  2 00:00:00 pk2-server sshd[1000]: Server listening on 0.0.0.0 port 22.
Dec  2 00:00:01 pk2-server sshd[1000]: Server listening on :: port 22.
Dec  2 00:00:10 pk2-server login[1001]: pam_unix(login:session): session opened for user visitor
`);
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
      this.initializePk2Files();
    }
    initializePk2Files() {
      this.createFile("/home/pk2/README.txt", `You found /home/pk2.

This is the home directory for Pete Karl II.
Inside are notes on past projects, mentoring, and a few personal favorites.

Use 'ls' to explore and 'cat' to read files.
`);
      this.createFile("/home/pk2/.bashrc", `# ~/.bashrc for pk2

export EDITOR=vim
export VISUAL=vim

alias ll='ls -alF'
alias la='ls -A'
alias gs='git status'
alias gd='git diff'

PS1='pk2@\\h:\\w\\$ '
`);
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
      this.createFile("/home/pk2/.ssh/authorized_keys", `# SSH keys (simulated)
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAISimulatedKey pk2@localhost
`);
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
      this.createFile("/home/pk2/docs/stack.txt", `TECH STACK NOTES

Data: BigQuery, dbt, vector databases
Cloud: GCP, Cloudflare
Frontend: React, React Native, TypeScript
Integrations: MS Teams, EHR systems (Epic, Cerner)
Compliance: SOC2, HiTRUST, HIPAA
`);
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
      this.createFile("/home/pk2/personal/about.txt", `ABOUT

Name: Pete Karl II
Location: Atlanta, Georgia
Education: Rochester Institute of Technology

I work on engineering leadership and AI products.
I like mentoring and teaching.

Contact: pete.karl@gmail.com
LinkedIn: linkedin.com/in/pkarl2
`);
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
      this.createFile("/home/pk2/personal/cities.txt", `CITIES

Lived in:
  Rochester, NY
  Boston, MA
  Atlanta, GA (current)
`);
    }
    createDirectoryNode(name) {
      return {
        type: "directory",
        name,
        children: /* @__PURE__ */ new Map(),
        permissions: "drwxr-xr-x",
        created: /* @__PURE__ */ new Date(),
        modified: /* @__PURE__ */ new Date()
      };
    }
    createFileNode(name, content = "") {
      return {
        type: "file",
        name,
        content,
        permissions: "-rw-r--r--",
        created: /* @__PURE__ */ new Date(),
        modified: /* @__PURE__ */ new Date()
      };
    }
    createNestedDirectory(path) {
      const parts = path.split("/").filter((p) => p !== "");
      let current = this.root;
      for (const part of parts) {
        if (!current.children.has(part)) {
          const newNode = this.createDirectoryNode(part);
          current.children.set(part, newNode);
        }
        current = current.children.get(part);
      }
      return current;
    }
    /**
     * Register a new alias in the alias manager
     * @param alias - The alias to register
     * @param path - The path it expands to
     */
    setAlias(alias, path) {
      this.aliasManager.setAlias(alias, path);
    }
    /**
     * Look up an alias in the alias manager
     * @param alias - The alias to look up
     * @returns The expanded path or undefined
     */
    getAlias(alias) {
      return this.aliasManager.getAlias(alias);
    }
    /**
     * Expand an alias in a path
     * @param path - The path potentially containing an alias
     * @returns The expanded path
     */
    expandAlias(path) {
      return this.aliasManager.expandAlias(path);
    }
    /**
     * Reverse expand a path to an alias if possible
     * @param path - The path to convert to an alias
     * @returns The aliased version or original path
     */
    reverseExpandAlias(path) {
      return this.aliasManager.reverseExpandAlias(path);
    }
    resolvePath(currentPath, targetPath) {
      targetPath = this.expandAlias(targetPath);
      if (targetPath.startsWith("/")) {
        currentPath = targetPath;
      } else {
        if (currentPath !== "/") {
          currentPath += "/" + targetPath;
        } else {
          currentPath = "/" + targetPath;
        }
      }
      const parts = currentPath.split("/").filter((p) => p !== "");
      const normalized = [];
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
    getNode(path) {
      if (path === "/")
        return this.root;
      const parts = path.split("/").filter((p) => p !== "");
      let current = this.root;
      for (const part of parts) {
        if (current.type !== "directory" || !current.children) {
          return null;
        }
        const next = current.children.get(part);
        if (!next)
          return null;
        current = next;
      }
      return current;
    }
    createDirectory(path) {
      const parts = path.split("/").filter((p) => p !== "");
      if (parts.length === 0)
        return false;
      const name = parts[parts.length - 1];
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = this.getNode(parentPath);
      if (!parent || parent.type !== "directory") {
        return false;
      }
      if (parent.children.has(name)) {
        return false;
      }
      parent.children.set(name, this.createDirectoryNode(name));
      parent.modified = /* @__PURE__ */ new Date();
      return true;
    }
    createFile(path, content = "") {
      const parts = path.split("/").filter((p) => p !== "");
      if (parts.length === 0)
        return false;
      const name = parts[parts.length - 1];
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = this.getNode(parentPath);
      if (!parent || parent.type !== "directory") {
        return false;
      }
      if (parent.children.has(name)) {
        return false;
      }
      parent.children.set(name, this.createFileNode(name, content));
      parent.modified = /* @__PURE__ */ new Date();
      return true;
    }
    listDirectory(path) {
      const node = this.getNode(path);
      if (!node || node.type !== "directory" || !node.children) {
        return [];
      }
      const entries = [];
      entries.push({
        type: "directory",
        name: ".",
        children: /* @__PURE__ */ new Map(),
        permissions: "drwxr-xr-x",
        created: node.created,
        modified: node.modified
      });
      entries.push({
        type: "directory",
        name: "..",
        children: /* @__PURE__ */ new Map(),
        permissions: "drwxr-xr-x",
        created: this.root.created,
        modified: this.root.modified
      });
      entries.push(...Array.from(node.children.values()));
      return entries;
    }
    changeDirectory(currentPath, targetPath) {
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
    deleteNode(path) {
      if (path === "/")
        return false;
      const parts = path.split("/").filter((p) => p !== "");
      const name = parts[parts.length - 1];
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = this.getNode(parentPath);
      if (!parent || parent.type !== "directory") {
        return false;
      }
      const hasChild = parent.children.has(name);
      if (hasChild) {
        parent.children.delete(name);
        parent.modified = /* @__PURE__ */ new Date();
        return true;
      }
      return false;
    }
    readFile(path) {
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
    getPathDisplay(currentPath) {
      return this.reverseExpandAlias(currentPath);
    }
  };

  // src/terminal/parser.ts
  function parseCommand(input) {
    const trimmed = input.trim();
    if (!trimmed) {
      return { command: "", args: [], flags: {} };
    }
    const tokens = tokenize(trimmed);
    const command = tokens[0] || "";
    const args = [];
    const flags = {};
    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.startsWith("--")) {
        const [flagName, value] = token.slice(2).split("=", 2);
        flags[flagName] = value !== void 0 ? value : true;
      } else if (token.startsWith("-") && token.length > 1 && token !== "-") {
        const flagChars = token.slice(1);
        if (flagChars.includes("=")) {
          const [flagPart, value] = flagChars.split("=", 2);
          for (const char of flagPart) {
            flags[char] = true;
          }
          if (value) {
            flags[flagPart] = value;
          }
        } else {
          for (const char of flagChars) {
            flags[char] = true;
          }
        }
      } else {
        args.push(token);
      }
    }
    return { command, args, flags };
  }
  function tokenize(input) {
    const tokens = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const nextChar = input[i + 1];
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = "";
      } else if (!inQuotes && char === " ") {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }
    if (current) {
      tokens.push(current);
    }
    return tokens;
  }

  // src/terminal/commands.ts
  function formatDate(date) {
    const now = /* @__PURE__ */ new Date();
    const isThisYear = date.getFullYear() === now.getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, " ");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const year = date.getFullYear();
    if (isThisYear) {
      return `${month} ${day} ${hours}:${minutes}`;
    } else {
      return `${month} ${day}  ${year}`;
    }
  }
  function formatFullDate(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const year = date.getFullYear();
    const timezone = "UTC";
    return `${dayName} ${month} ${day} ${hours}:${minutes}:${seconds} ${timezone} ${year}`;
  }
  function formatUptime(startTime) {
    const now = /* @__PURE__ */ new Date();
    const diff = now.getTime() - startTime.getTime();
    const seconds = Math.floor(diff / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `up ${days} day${days > 1 ? "s" : ""}, ${hours % 24}:${String(minutes % 60).padStart(2, "0")}`;
    } else if (hours > 0) {
      return `up ${hours}:${String(minutes % 60).padStart(2, "0")}`;
    } else {
      return `up ${minutes} min`;
    }
  }
  var commands = {
    pwd: (args, flags, fs, currentPath) => {
      return {
        output: currentPath
      };
    },
    ls: (args, flags, fs, currentPath) => {
      const targetPath = args.length > 0 ? fs.resolvePath(currentPath, args[0]) : currentPath;
      const nodes = fs.listDirectory(targetPath);
      if (nodes.length === 0) {
        return { output: "" };
      }
      const showLong = flags["l"];
      const showHidden = flags["a"];
      if (showLong) {
        let output = "";
        for (const node of nodes) {
          if (!showHidden && node.name.startsWith("."))
            continue;
          const permissions = node.permissions;
          const size = String(node.content?.length || 0).padStart(5, " ");
          const dateStr = formatDate(node.modified);
          const name = node.type === "directory" && node.name !== "." && node.name !== ".." ? node.name + "/" : node.name;
          output += `${permissions} user group ${size} ${dateStr} ${name}
`;
        }
        return { output: output.trimEnd() };
      } else {
        let output = "";
        for (const node of nodes) {
          if (!showHidden && node.name.startsWith("."))
            continue;
          const name = node.type === "directory" && node.name !== "." && node.name !== ".." ? node.name + "/" : node.name;
          output += name + "\n";
        }
        return { output: output.trimEnd() };
      }
    },
    cd: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { newPath: "/home/visitor" };
      }
      const result = fs.changeDirectory(currentPath, args[0]);
      if (typeof result === "string") {
        return { newPath: result };
      } else {
        return { error: result.error };
      }
    },
    mkdir: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "mkdir: missing operand" };
      }
      const createParents = flags["p"];
      const paths = args;
      for (const path of paths) {
        const fullPath = fs.resolvePath(currentPath, path);
        const parts = fullPath.split("/").filter((p) => p !== "");
        if (createParents) {
          let current = "";
          for (const part of parts) {
            current = current === "" ? "/" + part : current + "/" + part;
            fs.createDirectory(current);
          }
        } else {
          if (!fs.createDirectory(fullPath)) {
            return {
              error: `mkdir: cannot create directory '${path}': File exists`
            };
          }
        }
      }
      return { output: "" };
    },
    touch: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "touch: missing operand" };
      }
      for (const arg of args) {
        const fullPath = fs.resolvePath(currentPath, arg);
        if (!fs.createFile(fullPath)) {
          return { error: `touch: cannot create '${arg}': File exists` };
        }
      }
      return { output: "" };
    },
    cat: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "cat: missing operand" };
      }
      let output = "";
      for (const arg of args) {
        const fullPath = fs.resolvePath(currentPath, arg);
        const content = fs.readFile(fullPath);
        if (content === null) {
          return { error: `cat: ${arg}: No such file or directory` };
        }
        output += content;
        if (!content.endsWith("\n") && args.indexOf(arg) < args.length - 1) {
          output += "\n";
        }
      }
      return { output: output.trimEnd() };
    },
    rm: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "rm: missing operand" };
      }
      const recursive = flags["r"] || flags["R"];
      for (const arg of args) {
        const fullPath = fs.resolvePath(currentPath, arg);
        const node = fs.getNode(fullPath);
        if (!node) {
          return { error: `rm: cannot remove '${arg}': No such file or directory` };
        }
        if (node.type === "directory" && !recursive) {
          return {
            error: `rm: cannot remove '${arg}': Is a directory`
          };
        }
        if (!fs.deleteNode(fullPath)) {
          return { error: `rm: cannot remove '${arg}'` };
        }
      }
      return { output: "" };
    },
    clear: (args, flags, fs, currentPath) => {
      return { output: "__CLEAR__" };
    },
    help: (args, flags, fs, currentPath) => {
      const output = `Ubuntu Server Terminal Emulator - Available Commands

FILE OPERATIONS:
  ls [path]        List directory contents (-l long, -a all)
  cd [path]        Change directory
  pwd              Print working directory
  mkdir [dir]      Make directory (-p for parents)
  touch [file]     Create empty file
  cat [file]       Display file contents
  cp src dest      Copy files (-r recursive)
  mv src dest      Move/rename files
  rm [file]        Remove file (-r for directories)
  head [file]      Show first lines (-n count)
  tail [file]      Show last lines (-n count)
  wc [file]        Word/line/byte count (-l -w -c)
  find [path]      Find files (-name pattern, -type f/d)
  file [file]      Determine file type
  stat [file]      Display file status
  diff f1 f2       Compare files

TEXT PROCESSING:
  echo [text]      Print text
  grep pat file    Search in files (-i -n -v -c)
  sort [file]      Sort lines (-r -n -u)
  uniq [file]      Remove duplicates (-c -d -u)
  cut [file]       Cut columns (-d delim -f fields)
  rev [file]       Reverse lines
  tac [file]       Reverse file

SYSTEM INFORMATION:
  whoami           Display current user
  hostname         Display hostname
  uname            System info (-a for all)
  date             Display date/time
  id               Display user/group IDs
  uptime           System uptime
  ps               Process list (aux for all)
  top              System monitor
  free             Memory info (-h human readable)
  df               Disk space (-h human readable)
  du [path]        Directory usage (-h -s)
  lscpu            CPU information
  lsblk            Block devices
  arch             Machine architecture
  nproc            Number of processors

ENVIRONMENT:
  env              Show environment variables
  printenv [var]   Print environment variable
  export [var=val] Set environment variable
  history          Command history

COMMAND INFO:
  which [cmd]      Locate command
  whereis [cmd]    Locate command files
  type [cmd]       Display command type
  man [cmd]        Manual pages
  alias            Show aliases

NETWORKING (simulated):
  ifconfig         Network interfaces
  ip [addr|route]  IP configuration
  ping [host]      Test connectivity
  netstat          Network statistics
  ss               Socket statistics
  curl [url]       HTTP client
  wget [url]       Download files
  ssh [host]       SSH client
  scp              Secure copy

SYSTEM ADMIN (simulated):
  sudo [cmd]       Run as superuser
  chmod mode file  Change permissions
  chown user file  Change ownership
  mount            Show mounts
  fdisk -l         Disk partitions
  systemctl        Service management
  apt              Package management

UTILITIES:
  clear            Clear terminal
  exit/logout      Exit terminal
  cal              Calendar
  seq [n]          Print sequence
  expr             Evaluate expression
  factor [n]       Prime factors
  basename [path]  Strip directory
  dirname [path]   Strip filename
  realpath [path]  Resolve path

Type 'man <command>' for more details on specific commands.`;
      return { output };
    },
    echo: (args, flags, fs, currentPath) => {
      const output = args.join(" ");
      return { output };
    },
    whoami: (args, flags, fs, currentPath) => {
      return { output: "visitor" };
    },
    hostname: (args, flags, fs, currentPath) => {
      const hostnameContent = fs.readFile("/etc/hostname");
      return { output: hostnameContent?.trim() || "pk2-server" };
    },
    uname: (args, flags, fs, currentPath) => {
      const sysname = "Linux";
      const nodename = fs.readFile("/etc/hostname")?.trim() || "pk2-server";
      const release = "5.15.0-generic";
      const version = "#1 SMP Ubuntu";
      const machine = "x86_64";
      const processor = "x86_64";
      const platform = "x86_64";
      const os = "GNU/Linux";
      if (flags["a"]) {
        return { output: `${sysname} ${nodename} ${release} ${version} ${machine} ${processor} ${platform} ${os}` };
      }
      if (flags["s"])
        return { output: sysname };
      if (flags["n"])
        return { output: nodename };
      if (flags["r"])
        return { output: release };
      if (flags["v"])
        return { output: version };
      if (flags["m"])
        return { output: machine };
      if (flags["p"])
        return { output: processor };
      if (flags["i"])
        return { output: platform };
      if (flags["o"])
        return { output: os };
      return { output: sysname };
    },
    date: (args, flags, fs, currentPath) => {
      return { output: formatFullDate(/* @__PURE__ */ new Date()) };
    },
    id: (args, flags, fs, currentPath) => {
      return { output: "uid=1000(visitor) gid=1000(visitor) groups=1000(visitor),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev)" };
    },
    env: (args, flags, fs, currentPath, context) => {
      if (!context?.envVars) {
        return { output: "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOME=/home/visitor\nUSER=visitor\nSHELL=/bin/bash\nPWD=" + currentPath };
      }
      let output = "";
      for (const [key, value] of context.envVars) {
        output += `${key}=${value}
`;
      }
      return { output: output.trimEnd() };
    },
    printenv: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return commands.env(args, flags, fs, currentPath, context);
      }
      const varName = args[0];
      const value = context?.envVars?.get(varName);
      if (value) {
        return { output: value };
      }
      const defaults = {
        PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        HOME: "/home/visitor",
        USER: "visitor",
        SHELL: "/bin/bash",
        PWD: currentPath
      };
      if (defaults[varName]) {
        return { output: defaults[varName] };
      }
      return { output: "" };
    },
    export: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return commands.env(args, flags, fs, currentPath, context);
      }
      return { output: "" };
    },
    history: (args, flags, fs, currentPath, context) => {
      if (flags["c"]) {
        context?.clearHistory?.();
        return { output: "" };
      }
      if (!context?.commandHistory || context.commandHistory.length === 0) {
        return { output: "" };
      }
      let output = "";
      const history = context.commandHistory;
      const start = Math.max(0, history.length - 20);
      for (let i = start; i < history.length; i++) {
        output += `  ${String(i + 1).padStart(4, " ")}  ${history[i]}
`;
      }
      return { output: output.trimEnd() };
    },
    which: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "" };
      }
      const cmd = args[0];
      const availableCommands = Object.keys(commands);
      if (availableCommands.includes(cmd)) {
        return { output: `/usr/bin/${cmd}` };
      }
      return { error: `which: no ${cmd} in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)` };
    },
    whereis: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "" };
      }
      const cmd = args[0];
      const availableCommands = Object.keys(commands);
      if (availableCommands.includes(cmd)) {
        return { output: `${cmd}: /usr/bin/${cmd}` };
      }
      return { output: `${cmd}:` };
    },
    cp: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "cp: missing file operand" };
      }
      const recursive = flags["r"] || flags["R"];
      const source = fs.resolvePath(currentPath, args[0]);
      const dest = fs.resolvePath(currentPath, args[1]);
      const sourceNode = fs.getNode(source);
      if (!sourceNode) {
        return { error: `cp: cannot stat '${args[0]}': No such file or directory` };
      }
      if (sourceNode.type === "directory" && !recursive) {
        return { error: `cp: -r not specified; omitting directory '${args[0]}'` };
      }
      if (sourceNode.type === "file") {
        const content = fs.readFile(source) || "";
        if (!fs.createFile(dest, content)) {
          const destNode = fs.getNode(dest);
          if (destNode?.type === "directory") {
            const fileName = source.split("/").pop() || "";
            fs.createFile(dest + "/" + fileName, content);
          }
        }
      }
      return { output: "" };
    },
    mv: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "mv: missing file operand" };
      }
      const source = fs.resolvePath(currentPath, args[0]);
      const dest = fs.resolvePath(currentPath, args[1]);
      const sourceNode = fs.getNode(source);
      if (!sourceNode) {
        return { error: `mv: cannot stat '${args[0]}': No such file or directory` };
      }
      if (sourceNode.type === "file") {
        const content = fs.readFile(source) || "";
        const destNode = fs.getNode(dest);
        if (destNode?.type === "directory") {
          const fileName = source.split("/").pop() || "";
          fs.createFile(dest + "/" + fileName, content);
        } else {
          fs.createFile(dest, content);
        }
        fs.deleteNode(source);
      } else {
        return { error: `mv: cannot move '${args[0]}': Directory move not supported` };
      }
      return { output: "" };
    },
    head: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "head: missing file operand" };
      }
      const lines = typeof flags["n"] === "string" ? parseInt(flags["n"], 10) : 10;
      const filePath = fs.resolvePath(currentPath, args[0]);
      const content = fs.readFile(filePath);
      if (content === null) {
        return { error: `head: cannot open '${args[0]}' for reading: No such file or directory` };
      }
      const fileLines = content.split("\n");
      return { output: fileLines.slice(0, lines).join("\n") };
    },
    tail: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "tail: missing file operand" };
      }
      const lines = typeof flags["n"] === "string" ? parseInt(flags["n"], 10) : 10;
      const filePath = fs.resolvePath(currentPath, args[0]);
      const content = fs.readFile(filePath);
      if (content === null) {
        return { error: `tail: cannot open '${args[0]}' for reading: No such file or directory` };
      }
      const fileLines = content.split("\n");
      return { output: fileLines.slice(-lines).join("\n") };
    },
    wc: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "wc: missing file operand" };
      }
      let totalLines = 0;
      let totalWords = 0;
      let totalBytes = 0;
      let output = "";
      for (const arg of args) {
        const filePath = fs.resolvePath(currentPath, arg);
        const content = fs.readFile(filePath);
        if (content === null) {
          return { error: `wc: ${arg}: No such file or directory` };
        }
        const lines = content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
        const words = content.split(/\s+/).filter((w) => w.length > 0).length;
        const bytes = content.length;
        totalLines += lines;
        totalWords += words;
        totalBytes += bytes;
        if (flags["l"]) {
          output += `${lines} ${arg}
`;
        } else if (flags["w"]) {
          output += `${words} ${arg}
`;
        } else if (flags["c"]) {
          output += `${bytes} ${arg}
`;
        } else {
          output += `  ${String(lines).padStart(6, " ")} ${String(words).padStart(6, " ")} ${String(bytes).padStart(6, " ")} ${arg}
`;
        }
      }
      if (args.length > 1) {
        if (flags["l"]) {
          output += `${totalLines} total`;
        } else if (flags["w"]) {
          output += `${totalWords} total`;
        } else if (flags["c"]) {
          output += `${totalBytes} total`;
        } else {
          output += `  ${String(totalLines).padStart(6, " ")} ${String(totalWords).padStart(6, " ")} ${String(totalBytes).padStart(6, " ")} total`;
        }
      }
      return { output: output.trimEnd() };
    },
    exit: (args, flags, fs, currentPath) => {
      return { output: "logout", exit: true };
    },
    logout: (args, flags, fs, currentPath) => {
      return { output: "logout", exit: true };
    },
    uptime: (args, flags, fs, currentPath, context) => {
      const now = /* @__PURE__ */ new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const uptimeStr = context?.startTime ? formatUptime(context.startTime) : "up 0 min";
      return { output: ` ${hours}:${minutes}:${seconds} ${uptimeStr},  1 user,  load average: 0.00, 0.00, 0.00` };
    },
    df: (args, flags, fs, currentPath) => {
      const human = flags["h"];
      if (human) {
        return { output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   12G   35G  26% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
/dev/sda2       100G   45G   50G  48% /home` };
      }
      return { output: `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 12582912  36700160  26% /
tmpfs            2097152        0   2097152   0% /dev/shm
/dev/sda2      104857600 47185920  52428800  48% /home` };
    },
    du: (args, flags, fs, currentPath) => {
      const targetPath = args.length > 0 ? fs.resolvePath(currentPath, args[0]) : currentPath;
      const human = flags["h"];
      const summary = flags["s"];
      const node = fs.getNode(targetPath);
      if (!node) {
        return { error: `du: cannot access '${args[0] || "."}': No such file or directory` };
      }
      if (summary) {
        return { output: human ? "4.0K	" + targetPath : "4	" + targetPath };
      }
      return { output: human ? "4.0K	" + targetPath : "4	" + targetPath };
    },
    free: (args, flags, fs, currentPath) => {
      const human = flags["h"];
      if (human) {
        return { output: `              total        used        free      shared  buff/cache   available
Mem:          3.8Gi       1.2Gi       1.5Gi        64Mi       1.1Gi       2.3Gi
Swap:         2.0Gi          0B       2.0Gi` };
      }
      return { output: `              total        used        free      shared  buff/cache   available
Mem:        4000000     1200000     1500000       64000     1100000     2300000
Swap:       2097152           0     2097152` };
    },
    ps: (args, flags, fs, currentPath) => {
      const aux = flags["a"] || flags["aux"];
      if (aux) {
        return { output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 169936 11200 ?        Ss   00:00   0:01 /sbin/init
root         2  0.0  0.0      0     0 ?        S    00:00   0:00 [kthreadd]
visitor   1000  0.0  0.1  21464  5120 pts/0    Ss   00:00   0:00 -bash
visitor   1001  0.0  0.0  38384  3456 pts/0    R+   00:00   0:00 ps aux` };
      }
      return { output: `  PID TTY          TIME CMD
 1000 pts/0    00:00:00 bash
 1001 pts/0    00:00:00 ps` };
    },
    top: (args, flags, fs, currentPath, context) => {
      const now = /* @__PURE__ */ new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const uptimeStr = context?.startTime ? formatUptime(context.startTime) : "up 0 min";
      return { output: `top - ${hours}:${minutes}:${seconds} ${uptimeStr},  1 user,  load average: 0.00, 0.00, 0.00
Tasks:   4 total,   1 running,   3 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.3 us,  0.1 sy,  0.0 ni, 99.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   3906.2 total,   1536.0 free,   1200.0 used,   1170.2 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   2400.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  169936  11200   8320 S   0.0   0.3   0:01.00 init
 1000 visitor   20   0   21464   5120   3456 S   0.0   0.1   0:00.10 bash
 1001 visitor   20   0   38384   3456   2944 R   0.0   0.1   0:00.00 top` };
    },
    htop: (args, flags, fs, currentPath, context) => {
      return commands.top(args, flags, fs, currentPath, context);
    },
    chmod: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "chmod: missing operand" };
      }
      const node = fs.getNode(fs.resolvePath(currentPath, args[1]));
      if (!node) {
        return { error: `chmod: cannot access '${args[1]}': No such file or directory` };
      }
      return { output: "" };
    },
    chown: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "chown: missing operand" };
      }
      const node = fs.getNode(fs.resolvePath(currentPath, args[1]));
      if (!node) {
        return { error: `chown: cannot access '${args[1]}': No such file or directory` };
      }
      return { output: "" };
    },
    grep: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "grep: missing pattern or file operand" };
      }
      const pattern = args[0];
      const ignoreCase = flags["i"];
      const lineNumbers = flags["n"];
      const invertMatch = flags["v"];
      const countOnly = flags["c"];
      let output = "";
      let matchCount = 0;
      for (let i = 1; i < args.length; i++) {
        const filePath = fs.resolvePath(currentPath, args[i]);
        const content = fs.readFile(filePath);
        if (content === null) {
          return { error: `grep: ${args[i]}: No such file or directory` };
        }
        const lines = content.split("\n");
        const regex = new RegExp(pattern, ignoreCase ? "i" : "");
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
          const line = lines[lineNum];
          const matches = regex.test(line);
          const shouldInclude = invertMatch ? !matches : matches;
          if (shouldInclude) {
            matchCount++;
            if (!countOnly) {
              const prefix = args.length > 2 ? `${args[i]}:` : "";
              const linePrefix = lineNumbers ? `${lineNum + 1}:` : "";
              output += `${prefix}${linePrefix}${line}
`;
            }
          }
        }
      }
      if (countOnly) {
        return { output: String(matchCount) };
      }
      return { output: output.trimEnd() };
    },
    sort: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "sort: missing file operand" };
      }
      const reverse = flags["r"];
      const numeric = flags["n"];
      const unique = flags["u"];
      let allLines = [];
      for (const arg of args) {
        const filePath = fs.resolvePath(currentPath, arg);
        const content = fs.readFile(filePath);
        if (content === null) {
          return { error: `sort: cannot read: ${arg}: No such file or directory` };
        }
        allLines = allLines.concat(content.split("\n").filter((l) => l.length > 0));
      }
      if (numeric) {
        allLines.sort((a, b) => parseFloat(a) - parseFloat(b));
      } else {
        allLines.sort();
      }
      if (reverse) {
        allLines.reverse();
      }
      if (unique) {
        allLines = [...new Set(allLines)];
      }
      return { output: allLines.join("\n") };
    },
    uniq: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "uniq: missing file operand" };
      }
      const countPrefix = flags["c"];
      const onlyDuplicates = flags["d"];
      const onlyUnique = flags["u"];
      const filePath = fs.resolvePath(currentPath, args[0]);
      const content = fs.readFile(filePath);
      if (content === null) {
        return { error: `uniq: ${args[0]}: No such file or directory` };
      }
      const lines = content.split("\n");
      const result = [];
      let prevLine = "";
      let count = 0;
      for (const line of lines) {
        if (line === prevLine) {
          count++;
        } else {
          if (prevLine !== "" || count > 0) {
            const isDuplicate = count > 1;
            if (!onlyDuplicates && !onlyUnique || onlyDuplicates && isDuplicate || onlyUnique && !isDuplicate) {
              if (countPrefix) {
                result.push(`${String(count).padStart(7, " ")} ${prevLine}`);
              } else {
                result.push(prevLine);
              }
            }
          }
          prevLine = line;
          count = 1;
        }
      }
      if (prevLine !== "") {
        const isDuplicate = count > 1;
        if (!onlyDuplicates && !onlyUnique || onlyDuplicates && isDuplicate || onlyUnique && !isDuplicate) {
          if (countPrefix) {
            result.push(`${String(count).padStart(7, " ")} ${prevLine}`);
          } else {
            result.push(prevLine);
          }
        }
      }
      return { output: result.join("\n") };
    },
    find: (args, flags, fs, currentPath) => {
      const searchPath = args.length > 0 ? fs.resolvePath(currentPath, args[0]) : currentPath;
      const namePattern = typeof flags["name"] === "string" ? flags["name"] : null;
      const typeFilter = typeof flags["type"] === "string" ? flags["type"] : null;
      const results = [];
      function searchDir(path) {
        const node = fs.getNode(path);
        if (!node)
          return;
        if (node.type === "directory" && node.children) {
          for (const [name, child] of node.children) {
            const childPath = path === "/" ? `/${name}` : `${path}/${name}`;
            let matchesName = true;
            if (namePattern) {
              const regex = new RegExp("^" + namePattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
              matchesName = regex.test(name);
            }
            let matchesType = true;
            if (typeFilter) {
              if (typeFilter === "f")
                matchesType = child.type === "file";
              else if (typeFilter === "d")
                matchesType = child.type === "directory";
            }
            if (matchesName && matchesType) {
              results.push(childPath);
            }
            if (child.type === "directory") {
              searchDir(childPath);
            }
          }
        }
      }
      results.push(searchPath);
      searchDir(searchPath);
      return { output: results.join("\n") };
    },
    diff: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "diff: missing operand" };
      }
      const file1 = fs.resolvePath(currentPath, args[0]);
      const file2 = fs.resolvePath(currentPath, args[1]);
      const content1 = fs.readFile(file1);
      const content2 = fs.readFile(file2);
      if (content1 === null) {
        return { error: `diff: ${args[0]}: No such file or directory` };
      }
      if (content2 === null) {
        return { error: `diff: ${args[1]}: No such file or directory` };
      }
      if (content1 === content2) {
        return { output: "" };
      }
      const lines1 = content1.split("\n");
      const lines2 = content2.split("\n");
      let output = "";
      for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
        if (lines1[i] !== lines2[i]) {
          if (lines1[i] && !lines2[i]) {
            output += `${i + 1}d${i}
< ${lines1[i]}
`;
          } else if (!lines1[i] && lines2[i]) {
            output += `${i}a${i + 1}
> ${lines2[i]}
`;
          } else {
            output += `${i + 1}c${i + 1}
< ${lines1[i]}
---
> ${lines2[i]}
`;
          }
        }
      }
      return { output: output.trimEnd() };
    },
    file: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "file: missing file operand" };
      }
      let output = "";
      for (const arg of args) {
        const filePath = fs.resolvePath(currentPath, arg);
        const node = fs.getNode(filePath);
        if (!node) {
          output += `${arg}: cannot open (No such file or directory)
`;
        } else if (node.type === "directory") {
          output += `${arg}: directory
`;
        } else {
          const content = node.content || "";
          if (content.length === 0) {
            output += `${arg}: empty
`;
          } else if (content.startsWith("#!/")) {
            output += `${arg}: script, ASCII text executable
`;
          } else {
            output += `${arg}: ASCII text
`;
          }
        }
      }
      return { output: output.trimEnd() };
    },
    stat: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "stat: missing operand" };
      }
      const filePath = fs.resolvePath(currentPath, args[0]);
      const node = fs.getNode(filePath);
      if (!node) {
        return { error: `stat: cannot stat '${args[0]}': No such file or directory` };
      }
      const size = node.content?.length || 0;
      const type = node.type === "directory" ? "directory" : "regular file";
      return { output: `  File: ${args[0]}
  Size: ${size}        Blocks: 8          IO Block: 4096   ${type}
Device: 801h/2049d      Inode: 12345       Links: 1
Access: ${node.permissions}  Uid: ( 1000/ visitor)   Gid: ( 1000/ visitor)
Access: ${formatFullDate(node.modified)}
Modify: ${formatFullDate(node.modified)}
Change: ${formatFullDate(node.modified)}
 Birth: -` };
    },
    ln: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "ln: missing file operand" };
      }
      return { error: "ln: symbolic links not supported in virtual filesystem" };
    },
    man: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "What manual page do you want?" };
      }
      const cmd = args[0];
      const manPages = {
        ls: "LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs.\n\n       -a     do not ignore entries starting with .\n       -l     use a long listing format",
        cd: "CD(1)\n\nNAME\n       cd - change the working directory\n\nSYNOPSIS\n       cd [dir]\n\nDESCRIPTION\n       Change the current directory to dir.",
        pwd: "PWD(1)\n\nNAME\n       pwd - print name of current/working directory\n\nSYNOPSIS\n       pwd\n\nDESCRIPTION\n       Print the full filename of the current working directory.",
        cat: "CAT(1)\n\nNAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [FILE]...\n\nDESCRIPTION\n       Concatenate FILE(s) to standard output.",
        grep: "GREP(1)\n\nNAME\n       grep - print lines that match patterns\n\nSYNOPSIS\n       grep [OPTION]... PATTERNS [FILE]...\n\nDESCRIPTION\n       grep searches for PATTERNS in each FILE.\n\n       -i     ignore case\n       -n     print line numbers\n       -v     invert match\n       -c     count matches"
      };
      if (manPages[cmd]) {
        return { output: manPages[cmd] };
      }
      if (Object.keys(commands).includes(cmd)) {
        return { output: `${cmd.toUpperCase()}(1)

NAME
       ${cmd} - ${cmd} command

DESCRIPTION
       No manual entry for ${cmd}. Try 'help' for available commands.` };
      }
      return { error: `No manual entry for ${cmd}` };
    },
    alias: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "alias ll='ls -la'\nalias la='ls -A'\nalias l='ls -CF'" };
      }
      return { output: "" };
    },
    type: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "type: missing argument" };
      }
      const cmd = args[0];
      const builtins = ["cd", "pwd", "echo", "export", "alias", "type", "exit", "logout", "history"];
      if (builtins.includes(cmd)) {
        return { output: `${cmd} is a shell builtin` };
      }
      if (Object.keys(commands).includes(cmd)) {
        return { output: `${cmd} is /usr/bin/${cmd}` };
      }
      return { error: `type: ${cmd}: not found` };
    },
    true: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    false: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    yes: (args, flags, fs, currentPath) => {
      const text = args.length > 0 ? args.join(" ") : "y";
      let output = "";
      for (let i = 0; i < 20; i++) {
        output += text + "\n";
      }
      return { output: output.trimEnd() };
    },
    sleep: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    tty: (args, flags, fs, currentPath) => {
      return { output: "/dev/pts/0" };
    },
    groups: (args, flags, fs, currentPath) => {
      return { output: "visitor adm cdrom sudo dip plugdev" };
    },
    users: (args, flags, fs, currentPath) => {
      return { output: "visitor" };
    },
    w: (args, flags, fs, currentPath, context) => {
      const now = /* @__PURE__ */ new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const uptimeStr = context?.startTime ? formatUptime(context.startTime) : "up 0 min";
      return { output: ` ${hours}:${minutes}:${seconds} ${uptimeStr},  1 user,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
visitor  pts/0    -                00:00    0.00s  0.00s  0.00s -bash` };
    },
    last: (args, flags, fs, currentPath) => {
      return { output: `visitor  pts/0        -                Mon Dec  2 00:00   still logged in
reboot   system boot  5.15.0-generic   Mon Dec  2 00:00   still running

wtmp begins Mon Dec  2 00:00:00 2024` };
    },
    dmesg: (args, flags, fs, currentPath) => {
      return { output: `[    0.000000] Linux version 5.15.0-generic (buildd@lcy02-amd64-001)
[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.15.0-generic root=/dev/sda1
[    0.000000] BIOS-provided physical RAM map:
[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable
[    0.001000] Initializing cgroup subsys cpuset
[    0.002000] Initializing cgroup subsys cpu
[    0.003000] Linux version 5.15.0-generic compiled with gcc-11` };
    },
    lsb_release: (args, flags, fs, currentPath) => {
      if (flags["a"]) {
        return { output: `Distributor ID: Ubuntu
Description:    Ubuntu 22.04.3 LTS
Release:        22.04
Codename:       jammy` };
      }
      return { output: "Ubuntu 22.04.3 LTS" };
    },
    arch: (args, flags, fs, currentPath) => {
      return { output: "x86_64" };
    },
    nproc: (args, flags, fs, currentPath) => {
      return { output: "4" };
    },
    lscpu: (args, flags, fs, currentPath) => {
      return { output: `Architecture:            x86_64
CPU op-mode(s):          32-bit, 64-bit
Address sizes:           48 bits physical, 48 bits virtual
Byte Order:              Little Endian
CPU(s):                  4
On-line CPU(s) list:     0-3
Vendor ID:               GenuineIntel
Model name:              Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz
CPU family:              6
Model:                   142
Thread(s) per core:      2
Core(s) per socket:      2
Socket(s):               1
Stepping:                10
CPU max MHz:             4000.0000
CPU min MHz:             400.0000` };
    },
    ifconfig: (args, flags, fs, currentPath) => {
      return { output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>
        ether 00:00:00:00:00:00  txqueuelen 1000  (Ethernet)
        RX packets 1000  bytes 100000 (100.0 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 500  bytes 50000 (50.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 100  bytes 10000 (10.0 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 100  bytes 10000 (10.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0` };
    },
    ip: (args, flags, fs, currentPath) => {
      if (args.length === 0 || args[0] === "addr" || args[0] === "a") {
        return { output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:00:00:00:00:00 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86400sec preferred_lft 86400sec
    inet6 fe80::1/64 scope link
       valid_lft forever preferred_lft forever` };
      }
      if (args[0] === "route" || args[0] === "r") {
        return { output: `default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100` };
      }
      return { output: "Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\nOBJECT := { addr | route | link }" };
    },
    ping: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "ping: usage error: Destination address required" };
      }
      const host = args[0];
      return { output: `PING ${host} (127.0.0.1) 56(84) bytes of data.
64 bytes from ${host} (127.0.0.1): icmp_seq=1 ttl=64 time=0.050 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=2 ttl=64 time=0.045 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=3 ttl=64 time=0.048 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2000ms
rtt min/avg/max/mdev = 0.045/0.047/0.050/0.002 ms` };
    },
    netstat: (args, flags, fs, currentPath) => {
      return { output: `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN
tcp6       0      0 :::22                   :::*                    LISTEN
udp        0      0 0.0.0.0:68              0.0.0.0:*` };
    },
    ss: (args, flags, fs, currentPath) => {
      return { output: `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port
tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*
tcp    LISTEN  0       128      127.0.0.1:631          0.0.0.0:*
tcp    LISTEN  0       128      [::]:22                [::]:*` };
    },
    curl: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "curl: try 'curl --help' for more information" };
      }
      return { output: `curl: (6) Could not resolve host: ${args[0]}
Note: This is a simulated terminal. Network requests are not supported.` };
    },
    wget: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "wget: missing URL" };
      }
      const now = /* @__PURE__ */ new Date();
      const timestamp = now.toISOString().slice(0, 19).replace("T", " ");
      return { output: `--${timestamp}--  ${args[0]}
Resolving ${args[0]}... failed: Name or service not known.
wget: unable to resolve host address '${args[0]}'
Note: This is a simulated terminal. Network requests are not supported.` };
    },
    ssh: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface] ... destination" };
      }
      return { output: `ssh: connect to host ${args[0]} port 22: Connection refused
Note: This is a simulated terminal. SSH connections are not supported.` };
    },
    scp: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "usage: scp [-346BCpqrTv] ... source ... target" };
      }
      return { output: `scp: Connection refused
Note: This is a simulated terminal. SCP transfers are not supported.` };
    },
    systemctl: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "systemctl: command required" };
      }
      if (args[0] === "status") {
        return { output: `System is running in simulated mode.
Note: This is a simulated terminal. systemctl is not fully functional.` };
      }
      return { output: `Note: This is a simulated terminal. systemctl operations are not supported.` };
    },
    service: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "Usage: service <service> <action>" };
      }
      return { output: `Note: This is a simulated terminal. Service management is not supported.` };
    },
    sudo: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return { error: "usage: sudo -h | -K | -k | -V\nusage: sudo [-ABbEHnPS] [-C num] [-g group] [-h host] [-p prompt] [-T timeout] [-u user] [VAR=value] [-i|-s] [<command>]" };
      }
      const subCommand = args[0];
      const subArgs = args.slice(1);
      if (commands[subCommand]) {
        return commands[subCommand](subArgs, flags, fs, currentPath, context);
      }
      return { error: `sudo: ${subCommand}: command not found` };
    },
    su: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. User switching is not supported." };
    },
    passwd: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Password changes are not supported." };
    },
    useradd: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. User management is not supported." };
    },
    userdel: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. User management is not supported." };
    },
    groupadd: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Group management is not supported." };
    },
    apt: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "apt 2.4.10 (amd64)\nUsage: apt [options] command" };
      }
      return { output: `Note: This is a simulated terminal. Package management is not supported.` };
    },
    "apt-get": (args, flags, fs, currentPath) => {
      return commands.apt(args, flags, fs, currentPath);
    },
    dpkg: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Package management is not supported." };
    },
    snap: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Snap package management is not supported." };
    },
    reboot: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. System reboot is not supported." };
    },
    shutdown: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. System shutdown is not supported." };
    },
    poweroff: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. System poweroff is not supported." };
    },
    mount: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: `/dev/sda1 on / type ext4 (rw,relatime)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
/dev/sda2 on /home type ext4 (rw,relatime)` };
      }
      return { output: "Note: This is a simulated terminal. Mount operations are not supported." };
    },
    umount: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Unmount operations are not supported." };
    },
    fdisk: (args, flags, fs, currentPath) => {
      if (flags["l"]) {
        return { output: `Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors
Disk model: Virtual Disk
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt

Device       Start       End   Sectors  Size Type
/dev/sda1     2048 104857599 104855552   50G Linux filesystem
/dev/sda2 104857600 209715166 104857567   50G Linux filesystem` };
      }
      return { output: "Note: This is a simulated terminal. Disk partitioning is not supported." };
    },
    blkid: (args, flags, fs, currentPath) => {
      return { output: `/dev/sda1: UUID="12345678-1234-1234-1234-123456789abc" TYPE="ext4" PARTUUID="abcd1234-01"
/dev/sda2: UUID="87654321-4321-4321-4321-cba987654321" TYPE="ext4" PARTUUID="abcd1234-02"` };
    },
    lsblk: (args, flags, fs, currentPath) => {
      return { output: `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0   100G  0 disk
\u251C\u2500sda1   8:1    0    50G  0 part /
\u2514\u2500sda2   8:2    0    50G  0 part /home` };
    },
    tar: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Archive operations are not supported." };
    },
    gzip: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Compression is not supported." };
    },
    gunzip: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Decompression is not supported." };
    },
    zip: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Compression is not supported." };
    },
    unzip: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Decompression is not supported." };
    },
    basename: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "basename: missing operand" };
      }
      const path = args[0];
      const parts = path.split("/").filter((p) => p !== "");
      return { output: parts[parts.length - 1] || "/" };
    },
    dirname: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "dirname: missing operand" };
      }
      const path = args[0];
      const parts = path.split("/").filter((p) => p !== "");
      if (parts.length <= 1) {
        return { output: path.startsWith("/") ? "/" : "." };
      }
      return { output: "/" + parts.slice(0, -1).join("/") };
    },
    realpath: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "realpath: missing operand" };
      }
      return { output: fs.resolvePath(currentPath, args[0]) };
    },
    readlink: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "readlink: missing operand" };
      }
      if (flags["f"]) {
        return { output: fs.resolvePath(currentPath, args[0]) };
      }
      return { output: "" };
    },
    seq: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "seq: missing operand" };
      }
      let start = 1;
      let end = 1;
      let step = 1;
      if (args.length === 1) {
        end = parseInt(args[0], 10);
      } else if (args.length === 2) {
        start = parseInt(args[0], 10);
        end = parseInt(args[1], 10);
      } else {
        start = parseInt(args[0], 10);
        step = parseInt(args[1], 10);
        end = parseInt(args[2], 10);
      }
      const result = [];
      if (step > 0) {
        for (let i = start; i <= end; i += step) {
          result.push(i);
        }
      } else if (step < 0) {
        for (let i = start; i >= end; i += step) {
          result.push(i);
        }
      }
      return { output: result.join("\n") };
    },
    printf: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "" };
      }
      let format = args[0];
      const values = args.slice(1);
      format = format.replace(/\\n/g, "\n").replace(/\\t/g, "	");
      let result = format;
      let valueIndex = 0;
      result = result.replace(/%[sd]/g, () => {
        return values[valueIndex++] || "";
      });
      return { output: result };
    },
    test: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "" };
      }
      if (args[0] === "-e" || args[0] === "-f" || args[0] === "-d") {
        if (args.length < 2)
          return { output: "" };
        const path = fs.resolvePath(currentPath, args[1]);
        const node = fs.getNode(path);
        if (args[0] === "-e")
          return { output: "" };
        if (args[0] === "-f")
          return { output: "" };
        if (args[0] === "-d")
          return { output: "" };
      }
      return { output: "" };
    },
    "[": (args, flags, fs, currentPath) => {
      const newArgs = args.slice(0, -1);
      return commands.test(newArgs, flags, fs, currentPath);
    },
    expr: (args, flags, fs, currentPath) => {
      if (args.length < 3) {
        return { error: "expr: syntax error" };
      }
      const a = parseInt(args[0], 10);
      const op = args[1];
      const b = parseInt(args[2], 10);
      switch (op) {
        case "+":
          return { output: String(a + b) };
        case "-":
          return { output: String(a - b) };
        case "*":
          return { output: String(a * b) };
        case "/":
          return b !== 0 ? { output: String(Math.floor(a / b)) } : { error: "expr: division by zero" };
        case "%":
          return b !== 0 ? { output: String(a % b) } : { error: "expr: division by zero" };
        default:
          return { error: "expr: syntax error" };
      }
    },
    bc: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. bc calculator is not fully supported." };
    },
    cal: (args, flags, fs, currentPath) => {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = now.getDate();
      let output = `    ${months[month]} ${year}
`;
      output += "Su Mo Tu We Th Fr Sa\n";
      let line = "   ".repeat(firstDay);
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day === today ? `${String(day).padStart(2, " ")}` : String(day).padStart(2, " ");
        line += dayStr + " ";
        if ((firstDay + day) % 7 === 0) {
          output += line.trimEnd() + "\n";
          line = "";
        }
      }
      if (line) {
        output += line.trimEnd();
      }
      return { output: output.trimEnd() };
    },
    factor: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "factor: missing operand" };
      }
      const n = parseInt(args[0], 10);
      if (isNaN(n) || n < 1) {
        return { error: `factor: '${args[0]}' is not a valid positive integer` };
      }
      const factors = [];
      let num = n;
      for (let i = 2; i * i <= num; i++) {
        while (num % i === 0) {
          factors.push(i);
          num /= i;
        }
      }
      if (num > 1) {
        factors.push(num);
      }
      return { output: `${n}: ${factors.join(" ")}` };
    },
    rev: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "" };
      }
      const filePath = fs.resolvePath(currentPath, args[0]);
      const content = fs.readFile(filePath);
      if (content === null) {
        return { error: `rev: ${args[0]}: No such file or directory` };
      }
      const reversed = content.split("\n").map((line) => line.split("").reverse().join("")).join("\n");
      return { output: reversed };
    },
    tac: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "tac: missing file operand" };
      }
      const filePath = fs.resolvePath(currentPath, args[0]);
      const content = fs.readFile(filePath);
      if (content === null) {
        return { error: `tac: ${args[0]}: No such file or directory` };
      }
      const reversed = content.split("\n").reverse().join("\n");
      return { output: reversed };
    },
    cut: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "cut: you must specify a list of bytes, characters, or fields" };
      }
      const delimiter = typeof flags["d"] === "string" ? flags["d"] : "	";
      const fields = typeof flags["f"] === "string" ? flags["f"] : null;
      if (!fields) {
        return { error: "cut: you must specify a list of fields" };
      }
      const filePath = fs.resolvePath(currentPath, args[args.length - 1]);
      const content = fs.readFile(filePath);
      if (content === null) {
        return { error: `cut: ${args[args.length - 1]}: No such file or directory` };
      }
      const fieldNums = fields.split(",").map((f) => parseInt(f, 10) - 1);
      const lines = content.split("\n");
      const result = lines.map((line) => {
        const parts = line.split(delimiter);
        return fieldNums.map((f) => parts[f] || "").join(delimiter);
      });
      return { output: result.join("\n") };
    },
    tr: (args, flags, fs, currentPath) => {
      if (args.length < 2) {
        return { error: "tr: missing operand" };
      }
      return { output: "Note: tr requires stdin input which is not supported in this terminal." };
    },
    xargs: (args, flags, fs, currentPath) => {
      return { output: "Note: xargs requires stdin input which is not supported in this terminal." };
    },
    tee: (args, flags, fs, currentPath) => {
      return { output: "Note: tee requires stdin input which is not supported in this terminal." };
    },
    time: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return { output: "" };
      }
      const cmd = args[0];
      const cmdArgs = args.slice(1);
      if (commands[cmd]) {
        const result = commands[cmd](cmdArgs, flags, fs, currentPath, context);
        const output = result.output || "";
        return { output: `${output}

real    0m0.001s
user    0m0.000s
sys     0m0.001s` };
      }
      return { error: `time: ${cmd}: command not found` };
    },
    watch: (args, flags, fs, currentPath) => {
      return { output: "Note: watch requires continuous execution which is not supported in this terminal." };
    },
    crontab: (args, flags, fs, currentPath) => {
      if (flags["l"]) {
        return { output: "no crontab for visitor" };
      }
      return { output: "Note: This is a simulated terminal. Crontab management is not supported." };
    },
    at: (args, flags, fs, currentPath) => {
      return { output: "Note: This is a simulated terminal. Job scheduling is not supported." };
    },
    jobs: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    fg: (args, flags, fs, currentPath) => {
      return { error: "fg: no current job" };
    },
    bg: (args, flags, fs, currentPath) => {
      return { error: "bg: no current job" };
    },
    kill: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]" };
      }
      return { output: "" };
    },
    killall: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "killall: no process name specified" };
      }
      return { output: "" };
    },
    pkill: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "pkill: no matching criteria specified" };
      }
      return { output: "" };
    },
    pgrep: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "pgrep: no matching criteria specified" };
      }
      return { output: "1000" };
    },
    nice: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return { output: "0" };
      }
      const cmd = args[0];
      const cmdArgs = args.slice(1);
      if (commands[cmd]) {
        return commands[cmd](cmdArgs, flags, fs, currentPath, context);
      }
      return { error: `nice: ${cmd}: command not found` };
    },
    nohup: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return { error: "nohup: missing operand" };
      }
      return { output: "nohup: Note: This is a simulated terminal. nohup is not fully functional." };
    },
    timeout: (args, flags, fs, currentPath, context) => {
      if (args.length < 2) {
        return { error: "timeout: missing operand" };
      }
      const cmd = args[1];
      const cmdArgs = args.slice(2);
      if (commands[cmd]) {
        return commands[cmd](cmdArgs, flags, fs, currentPath, context);
      }
      return { error: `timeout: ${cmd}: command not found` };
    },
    source: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "source: filename argument required" };
      }
      return { output: "" };
    },
    ".": (args, flags, fs, currentPath) => {
      return commands.source(args, flags, fs, currentPath);
    },
    set: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    unset: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    read: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    declare: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    local: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    return: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    break: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    continue: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    shift: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    getopts: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    eval: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    exec: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    trap: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    wait: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    hash: (args, flags, fs, currentPath) => {
      return { output: "hash: hash table empty" };
    },
    enable: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    builtin: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return { output: "" };
      }
      const cmd = args[0];
      const cmdArgs = args.slice(1);
      if (commands[cmd]) {
        return commands[cmd](cmdArgs, flags, fs, currentPath, context);
      }
      return { error: `builtin: ${cmd}: not a shell builtin` };
    },
    command: (args, flags, fs, currentPath, context) => {
      if (args.length === 0) {
        return { output: "" };
      }
      const cmd = args[0];
      const cmdArgs = args.slice(1);
      if (commands[cmd]) {
        return commands[cmd](cmdArgs, flags, fs, currentPath, context);
      }
      return { error: `command: ${cmd}: command not found` };
    },
    compgen: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    complete: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    shopt: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    ulimit: (args, flags, fs, currentPath) => {
      if (flags["a"]) {
        return { output: `core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 15738
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 15738
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited` };
      }
      return { output: "unlimited" };
    },
    umask: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: "0022" };
      }
      return { output: "" };
    },
    times: (args, flags, fs, currentPath) => {
      return { output: "0m0.000s 0m0.000s\n0m0.000s 0m0.000s" };
    },
    fc: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    bind: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    dirs: (args, flags, fs, currentPath) => {
      return { output: currentPath };
    },
    pushd: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { output: currentPath };
      }
      const result = fs.changeDirectory(currentPath, args[0]);
      if (typeof result === "string") {
        return { output: result, newPath: result };
      }
      return { error: result.error };
    },
    popd: (args, flags, fs, currentPath) => {
      return { output: currentPath };
    },
    disown: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    suspend: (args, flags, fs, currentPath) => {
      return { error: "suspend: cannot suspend a login shell" };
    },
    mapfile: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    readarray: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    coproc: (args, flags, fs, currentPath) => {
      return { output: "" };
    },
    let: (args, flags, fs, currentPath) => {
      return { output: "" };
    }
  };
  function executeCommand(command, args, flags, fs, currentPath, context) {
    const handler = commands[command];
    if (!handler) {
      return { error: `pk2sh: command not found: ${command}` };
    }
    return handler(args, flags, fs, currentPath, context);
  }

  // src/terminal/terminal.ts
  var TerminalController = class {
    constructor() {
      __publicField(this, "filesystem");
      __publicField(this, "currentPath", "/home/visitor");
      __publicField(this, "commandHistory", []);
      __publicField(this, "historyIndex", 0);
      __publicField(this, "currentInput", "");
      __publicField(this, "multilineMode", false);
      __publicField(this, "multilineBuffer", []);
      __publicField(this, "outputElement");
      __publicField(this, "mobileInput", null);
      __publicField(this, "currentPromptLine", null);
      __publicField(this, "maxHistory", 100);
      __publicField(this, "startTime", /* @__PURE__ */ new Date());
      __publicField(this, "envVars", /* @__PURE__ */ new Map());
      __publicField(this, "isExited", false);
      this.filesystem = new VirtualFileSystem();
      this.outputElement = document.getElementById("terminal-output");
      if (!this.outputElement) {
        throw new Error("Terminal output element not found in DOM");
      }
      this.initializeEnvVars();
      this.initialize();
    }
    initializeEnvVars() {
      this.envVars.set("PATH", "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin");
      this.envVars.set("HOME", "/home/visitor");
      this.envVars.set("USER", "visitor");
      this.envVars.set("SHELL", "/bin/bash");
      this.envVars.set("PWD", this.currentPath);
      this.envVars.set("TERM", "xterm-256color");
      this.envVars.set("LANG", "en_US.UTF-8");
      this.envVars.set("HOSTNAME", "pk2-server");
    }
    getCommandContext() {
      return {
        commandHistory: this.commandHistory,
        envVars: this.envVars,
        startTime: this.startTime,
        clearHistory: () => {
          this.commandHistory = [];
          this.historyIndex = 0;
        }
      };
    }
    initialize() {
      this.showMotd();
      this.showPrompt();
      document.addEventListener("keydown", (e) => this.handleKeyDown(e));
      this.mobileInput = document.getElementById("mobile-input");
      if (this.mobileInput) {
        this.setupMobileInput();
      }
    }
    setupMobileInput() {
      if (!this.mobileInput)
        return;
      const container = document.getElementById("terminal-container");
      if (container) {
        container.addEventListener("click", () => this.focusMobileInput());
        container.addEventListener("touchstart", () => this.focusMobileInput());
      }
      this.mobileInput.addEventListener("input", (e) => this.handleMobileInput(e));
      this.mobileInput.addEventListener("keydown", (e) => this.handleMobileKeyDown(e));
    }
    focusMobileInput() {
      if (this.mobileInput && !this.isExited) {
        this.mobileInput.focus();
      }
    }
    handleMobileInput(event) {
      if (this.isExited || !this.mobileInput)
        return;
      const inputType = event.inputType;
      const data = event.data;
      if (inputType === "insertText" && data) {
        this.currentInput += data;
        this.updateInputDisplay();
      } else if (inputType === "deleteContentBackward") {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateInputDisplay();
      }
      this.mobileInput.value = "";
    }
    handleMobileKeyDown(event) {
      if (this.isExited)
        return;
      if (event.key === "Enter") {
        event.preventDefault();
        this.handleEnter();
        if (this.mobileInput) {
          this.mobileInput.value = "";
        }
      }
    }
    showMotd() {
      const motd = this.filesystem.readFile("/etc/motd");
      if (motd) {
        this.addOutput(motd.trim(), "info");
      }
    }
    handleKeyDown(event) {
      if (this.isExited)
        return;
      if (this.mobileInput && event.target === this.mobileInput) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        this.handleEnter();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.navigateHistory("up");
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.navigateHistory("down");
      } else if (event.key === "Backspace") {
        event.preventDefault();
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateInputDisplay();
      } else if (event.key === "Control" || event.key === "Ctrl") {
      } else if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        this.handleCtrlC();
      } else if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        this.clearOutput();
        this.showPrompt();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        this.currentInput += event.key;
        this.updateInputDisplay();
      }
    }
    handleEnter() {
      if (this.multilineMode) {
        if (this.currentInput.endsWith("\\")) {
          this.multilineBuffer.push(this.currentInput.slice(0, -1));
          this.currentInput = "";
          this.updateInputDisplay();
          this.updatePromptText("> ");
        } else {
          this.multilineBuffer.push(this.currentInput);
          const fullCommand = this.multilineBuffer.join(" ");
          this.multilineMode = false;
          this.multilineBuffer = [];
          this.currentInput = "";
          this.executeCommand(fullCommand);
          this.showPrompt();
        }
      } else {
        if (this.currentInput.endsWith("\\")) {
          this.multilineMode = true;
          this.multilineBuffer = [this.currentInput.slice(0, -1)];
          this.currentInput = "";
          this.updateInputDisplay();
          this.updatePromptText("> ");
        } else {
          if (this.currentInput.trim()) {
            this.addToHistory(this.currentInput);
          }
          this.executeCommand(this.currentInput);
          this.currentInput = "";
          this.showPrompt();
        }
      }
    }
    handleCtrlC() {
      if (this.multilineMode) {
        this.multilineMode = false;
        this.multilineBuffer = [];
        this.currentInput = "";
        this.updateInputDisplay();
        this.showPrompt();
      } else if (this.currentInput) {
        this.currentInput = "";
        this.updateInputDisplay();
        this.showPrompt();
      }
    }
    executeCommand(input) {
      if (!input.trim()) {
        return;
      }
      this.envVars.set("PWD", this.currentPath);
      const parsed = parseCommand(input);
      const result = executeCommand(
        parsed.command,
        parsed.args,
        parsed.flags,
        this.filesystem,
        this.currentPath,
        this.getCommandContext()
      );
      if (result.exit) {
        this.isExited = true;
        this.addOutput("logout", "info");
        return;
      }
      if (result.error) {
        this.addOutput(result.error, "error");
      } else if (result.output) {
        if (result.output === "__CLEAR__") {
          this.clearOutput();
        } else {
          this.addOutput(result.output, "info");
        }
      }
      if (result.newPath) {
        this.currentPath = result.newPath;
        this.envVars.set("PWD", result.newPath);
      }
    }
    addOutput(text, type) {
      const line = document.createElement("div");
      line.className = `output-line output-${type}`;
      line.textContent = text;
      this.outputElement.appendChild(line);
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    clearOutput() {
      this.outputElement.innerHTML = "";
    }
    showPrompt() {
      if (this.isExited)
        return;
      this.currentInput = "";
      this.historyIndex = this.commandHistory.length;
      if (this.currentPromptLine) {
        const oldCursor = this.currentPromptLine.querySelector(".cursor");
        if (oldCursor) {
          oldCursor.remove();
        }
      }
      const promptLine = document.createElement("div");
      promptLine.className = "prompt-line";
      const promptSpan = document.createElement("span");
      promptSpan.className = "prompt-text";
      const displayPath = this.filesystem.getPathDisplay(this.currentPath);
      promptSpan.textContent = `visitor@terminal:${displayPath}$ `;
      const inputSpan = document.createElement("span");
      inputSpan.className = "input-text";
      inputSpan.textContent = "";
      const cursorSpan = document.createElement("span");
      cursorSpan.className = "cursor";
      cursorSpan.textContent = "_";
      promptLine.appendChild(promptSpan);
      promptLine.appendChild(inputSpan);
      promptLine.appendChild(cursorSpan);
      this.outputElement.appendChild(promptLine);
      this.currentPromptLine = promptLine;
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    updatePromptText(promptText) {
      if (this.currentPromptLine) {
        const promptSpan = this.currentPromptLine.querySelector(".prompt-text");
        if (promptSpan) {
          promptSpan.textContent = promptText + " ";
        }
      }
    }
    updateInputDisplay() {
      if (this.currentPromptLine) {
        const inputSpan = this.currentPromptLine.querySelector(".input-text");
        if (inputSpan) {
          inputSpan.textContent = this.currentInput;
        }
      }
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    navigateHistory(direction) {
      if (direction === "up") {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.currentInput = this.commandHistory[this.historyIndex];
        }
      } else {
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.currentInput = this.commandHistory[this.historyIndex];
        } else if (this.historyIndex === this.commandHistory.length - 1) {
          this.historyIndex++;
          this.currentInput = "";
        }
      }
      this.updateInputDisplay();
    }
    addToHistory(command) {
      this.commandHistory.push(command);
      if (this.commandHistory.length > this.maxHistory) {
        this.commandHistory.shift();
      }
      this.historyIndex = this.commandHistory.length;
    }
  };

  // src/client/terminal-client.ts
  document.addEventListener("DOMContentLoaded", () => {
    try {
      new TerminalController();
    } catch (error) {
      console.error("Failed to initialize terminal:", error);
      const errorEl = document.getElementById("terminal-output");
      if (errorEl) {
        errorEl.innerHTML = `<div class="output-line output-error">Failed to initialize terminal: ${error}</div>`;
      }
    }
  });
})();
